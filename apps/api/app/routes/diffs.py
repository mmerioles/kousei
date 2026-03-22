from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from libs.models.database import get_db
from libs.models.network import Attribution, Diff
from libs.models.schemas import AttributionRead, DiffRead

router = APIRouter(prefix="/diffs", tags=["diffs"])


@router.get("/{diff_id}")
def get_diff(diff_id: int, session: Session = Depends(get_db)) -> dict:
    diff = session.get(Diff, diff_id)
    if diff is None:
        raise HTTPException(status_code=404, detail="Diff not found")
    attribution = session.scalar(select(Attribution).where(Attribution.diff_id == diff.id))
    return {
        "diff": DiffRead.model_validate(diff).model_dump(),
        "attribution": AttributionRead.model_validate(attribution).model_dump() if attribution else None,
    }

