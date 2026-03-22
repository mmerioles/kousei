from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from libs.models.database import get_db
from libs.models.network import Device, Diff, Event, Snapshot
from libs.models.schemas import EventRead, OverviewRead

router = APIRouter(tags=["overview"])


@router.get("/overview", response_model=OverviewRead)
def overview(session: Session = Depends(get_db)) -> OverviewRead:
    recent_events = session.scalars(select(Event).order_by(Event.occurred_at.desc()).limit(10)).all()
    return OverviewRead(
        device_count=session.scalar(select(func.count()).select_from(Device)) or 0,
        snapshot_count=session.scalar(select(func.count()).select_from(Snapshot)) or 0,
        diff_count=session.scalar(select(func.count()).select_from(Diff)) or 0,
        recent_events=[EventRead.model_validate(event) for event in recent_events],
    )

