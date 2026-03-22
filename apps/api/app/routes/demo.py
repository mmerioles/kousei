from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from libs.models.database import get_db
from libs.models.network import Device, Diff, Event, Snapshot
from libs.models.pipeline import collect_snapshot_pipeline
from libs.models.security import encrypt_secret

router = APIRouter(prefix="/demo", tags=["demo"])

DEMO_HOSTNAME = "leaf-evpn-01"
DEMO_STEPS = [
    {"actor": "lab.seed", "event_type": "manual_seed", "cause": "manual"},
    {"actor": "ops.jane", "event_type": "config_change", "cause": "manual"},
    {"actor": "neteng.marcus", "event_type": "config_change", "cause": "manual"},
]


@router.post("/bootstrap")
def bootstrap_demo(session: Session = Depends(get_db)) -> dict[str, int | str]:
    device = session.scalar(select(Device).where(Device.hostname == DEMO_HOSTNAME))
    if device is None:
        device = Device(
            hostname=DEMO_HOSTNAME,
            mgmt_ip="10.0.0.21",
            vendor="nxos",
            platform="n9k-fixture",
            username="demo",
            password_encrypted=encrypt_secret("demo"),
            polling_interval=300,
            enabled=True,
        )
        session.add(device)
        session.commit()
        session.refresh(device)

    snapshot_count = session.scalar(
        select(func.count()).select_from(Snapshot).where(Snapshot.device_id == device.id)
    ) or 0

    for step in DEMO_STEPS[snapshot_count:]:
        event = Event(
            device_id=device.id,
            occurred_at=datetime.now(timezone.utc),
            source="manual",
            event_type=step["event_type"],
            raw_payload={
                "actor": step["actor"],
                "message": f"{step['actor']} triggered the fixture capture",
            },
        )
        session.add(event)
        session.flush()
        collect_snapshot_pipeline(
            session,
            device_id=device.id,
            cause=str(step["cause"]),
            trigger_event_id=event.id,
        )

    final_snapshot_count = session.scalar(
        select(func.count()).select_from(Snapshot).where(Snapshot.device_id == device.id)
    ) or 0
    final_diff_count = session.scalar(
        select(func.count()).select_from(Diff).where(Diff.device_id == device.id)
    ) or 0

    return {
        "device_id": device.id,
        "hostname": device.hostname,
        "snapshot_count": final_snapshot_count,
        "diff_count": final_diff_count,
    }
