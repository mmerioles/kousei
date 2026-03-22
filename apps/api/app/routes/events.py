from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from libs.models.database import get_db
from libs.models.network import Event
from libs.models.schemas import EventRead

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventRead])
def list_events(session: Session = Depends(get_db), limit: int = 100) -> list[Event]:
    return session.scalars(select(Event).order_by(Event.occurred_at.desc()).limit(limit)).all()

