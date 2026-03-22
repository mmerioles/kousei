from __future__ import annotations

import hashlib
import logging
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from libs.attribution import correlate_actor
from libs.collectors import collect_running_config
from libs.diffing import build_diff_artifacts
from libs.models.network import Attribution, Device, Diff, Event, Snapshot
from libs.models.security import decrypt_secret
from libs.models.storage import write_snapshot_file
from libs.normalizers import normalize_config

logger = logging.getLogger(__name__)


def _hash_config(config: str) -> str:
    return hashlib.sha256(config.encode()).hexdigest()


def collect_snapshot_pipeline(
    session: Session,
    device_id: int,
    cause: str,
    trigger_event_id: int | None = None,
) -> dict:
    device = session.get(Device, device_id)
    if device is None:
        raise ValueError(f"Device {device_id} not found")
    if not device.enabled:
        logger.info("device_disabled", extra={"device_id": device_id})
        return {"status": "skipped", "reason": "device_disabled"}

    snapshot_count = session.scalar(
        select(func.count()).select_from(Snapshot).where(Snapshot.device_id == device_id)
    ) or 0

    raw_config = collect_running_config(
        device,
        decrypt_secret(device.password_encrypted),
        revision_index=snapshot_count,
    )
    normalized = normalize_config(raw_config)
    config_hash = _hash_config(normalized)

    latest_snapshot = session.scalar(
        select(Snapshot)
        .where(Snapshot.device_id == device_id)
        .order_by(Snapshot.collected_at.desc(), Snapshot.id.desc())
    )
    if latest_snapshot and latest_snapshot.config_hash == config_hash:
        device.last_seen = datetime.now(timezone.utc)
        session.commit()
        return {"status": "unchanged", "snapshot_id": latest_snapshot.id}

    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y%m%dT%H%M%SZ")
    raw_path = write_snapshot_file(device_id, f"{stamp}-raw.cfg", raw_config)
    normalized_path = write_snapshot_file(device_id, f"{stamp}-normalized.cfg", normalized)

    snapshot = Snapshot(
        device_id=device_id,
        collected_at=now,
        cause=cause,
        config_hash=config_hash,
        raw_config_path=raw_path,
        normalized_config_path=normalized_path,
    )
    session.add(snapshot)
    session.flush()

    previous_config = ""
    from_snapshot_id = None
    if latest_snapshot:
        previous_config = Path(latest_snapshot.normalized_config_path).read_text(encoding="utf-8")
        from_snapshot_id = latest_snapshot.id

    raw_diff, semantic_diff, summary, risk_score = build_diff_artifacts(previous_config, normalized)
    diff = Diff(
        device_id=device_id,
        from_snapshot_id=from_snapshot_id,
        to_snapshot_id=snapshot.id,
        raw_diff=raw_diff,
        semantic_diff=semantic_diff,
        summary=summary,
        risk_score=risk_score,
    )
    session.add(diff)
    session.flush()

    actor, confidence, evidence = correlate_actor(session, device_id, now)
    attribution = Attribution(diff_id=diff.id, actor=actor, confidence=confidence, evidence=evidence)
    session.add(attribution)

    device.last_seen = now
    if trigger_event_id:
        trigger_event = session.get(Event, trigger_event_id)
        if trigger_event:
            payload = trigger_event.raw_payload or {}
            payload["snapshot_id"] = snapshot.id
            trigger_event.raw_payload = payload
    session.commit()

    return {
        "status": "changed",
        "snapshot_id": snapshot.id,
        "diff_id": diff.id,
        "attribution_id": attribution.id,
    }
