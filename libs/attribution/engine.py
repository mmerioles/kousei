from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from libs.models.network import Event


def correlate_actor(session: Session, device_id: int, changed_at: datetime) -> tuple[str, int, dict]:
    if changed_at.tzinfo is None:
        changed_at = changed_at.replace(tzinfo=timezone.utc)

    window_start = changed_at - timedelta(minutes=5)
    window_end = changed_at + timedelta(minutes=1)

    events = session.scalars(
        select(Event)
        .where(Event.device_id == device_id)
        .where(Event.occurred_at >= window_start)
        .where(Event.occurred_at <= window_end)
        .order_by(Event.occurred_at.desc())
    ).all()

    actor_scores: dict[str, int] = {}
    actor_evidence: dict[str, list[str]] = {}

    for event in events:
        payload = event.raw_payload or {}
        actor = payload.get("actor") or payload.get("username")
        if not actor:
            continue

        score = 0
        evidence: list[str] = []
        if event.event_type in {"login", "aaa_login", "tacacs_login"}:
            score += 30
            evidence.append("tacacs_login")
        if event.event_type in {"config_change", "syslog_config_change"}:
            score += 40
            evidence.append("syslog_config_change")
        if event.source == "manual":
            score += 15
            evidence.append("manual_trigger")

        if score:
            actor_scores[actor] = actor_scores.get(actor, 0) + score
            actor_evidence.setdefault(actor, []).extend(evidence)

    if not actor_scores:
        return "unknown", 0, {"evidence": ["no_correlated_identity_events"], "matched_event_ids": []}

    actor = max(actor_scores, key=actor_scores.get)
    matched_ids = [event.id for event in events if (event.raw_payload or {}).get("actor") == actor]
    return actor, min(100, actor_scores[actor]), {
        "evidence": sorted(set(actor_evidence[actor])),
        "matched_event_ids": matched_ids,
    }

