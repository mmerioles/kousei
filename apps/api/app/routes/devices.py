from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from libs.models.database import get_db
from libs.models.network import Attribution, Device, Diff, Event, Snapshot
from libs.models.pipeline import collect_snapshot_pipeline
from libs.models.schemas import (
    CollectRequest,
    DeviceCreate,
    DeviceRead,
    DeviceUpdate,
    SnapshotRead,
    TimelineEntry,
)
from libs.models.security import encrypt_secret

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("", response_model=list[DeviceRead])
def list_devices(session: Session = Depends(get_db)) -> list[Device]:
    return session.scalars(select(Device).order_by(Device.hostname)).all()


@router.post("", response_model=DeviceRead, status_code=status.HTTP_201_CREATED)
def create_device(payload: DeviceCreate, session: Session = Depends(get_db)) -> Device:
    device = Device(
        hostname=payload.hostname,
        mgmt_ip=payload.mgmt_ip,
        vendor=payload.vendor,
        platform=payload.platform,
        username=payload.username,
        password_encrypted=encrypt_secret(payload.password),
        credentials_ref=payload.credentials_ref,
        polling_interval=payload.polling_interval,
        enabled=payload.enabled,
    )
    session.add(device)
    session.commit()
    session.refresh(device)
    return device


@router.get("/{device_id}", response_model=DeviceRead)
def get_device(device_id: int, session: Session = Depends(get_db)) -> Device:
    device = session.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.patch("/{device_id}", response_model=DeviceRead)
def update_device(device_id: int, payload: DeviceUpdate, session: Session = Depends(get_db)) -> Device:
    device = session.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "password":
            device.password_encrypted = encrypt_secret(value)
        else:
            setattr(device, field, value)
    session.commit()
    session.refresh(device)
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(device_id: int, session: Session = Depends(get_db)) -> None:
    device = session.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    session.delete(device)
    session.commit()


@router.post("/{device_id}/collect", status_code=status.HTTP_202_ACCEPTED)
def collect_now(
    device_id: int,
    payload: CollectRequest,
    session: Session = Depends(get_db),
) -> dict[str, str | int | None]:
    device = session.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    result = collect_snapshot_pipeline(session, device_id=device.id, cause=payload.cause)
    return {
        "status": str(result.get("status", "unknown")),
        "device_id": device.id,
        "snapshot_id": result.get("snapshot_id"),
        "diff_id": result.get("diff_id"),
    }


@router.get("/{device_id}/snapshots", response_model=list[SnapshotRead])
def list_snapshots(device_id: int, session: Session = Depends(get_db)) -> list[Snapshot]:
    return session.scalars(
        select(Snapshot)
        .where(Snapshot.device_id == device_id)
        .order_by(Snapshot.collected_at.desc(), Snapshot.id.desc())
    ).all()


@router.get("/{device_id}/timeline", response_model=list[TimelineEntry])
def device_timeline(device_id: int, session: Session = Depends(get_db)) -> list[TimelineEntry]:
    device = session.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    entries: list[TimelineEntry] = []
    snapshots = session.scalars(select(Snapshot).where(Snapshot.device_id == device_id)).all()
    diffs = session.scalars(select(Diff).where(Diff.device_id == device_id)).all()
    events = session.scalars(select(Event).where(Event.device_id == device_id)).all()

    attribution_by_diff = {
        attribution.diff_id: attribution
        for attribution in session.scalars(
            select(Attribution).join(Diff).where(Diff.device_id == device_id)
        ).all()
    }

    for snapshot in snapshots:
        entries.append(
            TimelineEntry(
                timestamp=snapshot.collected_at,
                kind="snapshot",
                payload=SnapshotRead.model_validate(snapshot).model_dump(),
            )
        )
    for diff in diffs:
        attribution = attribution_by_diff.get(diff.id)
        payload = {
            "id": diff.id,
            "summary": diff.summary,
            "risk_score": diff.risk_score,
            "semantic_diff": diff.semantic_diff,
            "attribution": {
                "actor": attribution.actor,
                "confidence": attribution.confidence,
            }
            if attribution
            else None,
        }
        entries.append(TimelineEntry(timestamp=diff.created_at, kind="diff", payload=payload))
    for event in events:
        entries.append(
            TimelineEntry(
                timestamp=event.occurred_at,
                kind="event",
                payload={
                    "id": event.id,
                    "source": event.source,
                    "event_type": event.event_type,
                    "raw_payload": event.raw_payload,
                },
            )
        )

    return sorted(entries, key=lambda item: item.timestamp, reverse=True)
