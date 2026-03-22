from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from libs.models.database import SessionLocal

logger = logging.getLogger(__name__)


def run_db_task(fn, *args, **kwargs):
    session: Session = SessionLocal()
    try:
        return fn(session, *args, **kwargs)
    except Exception:
        session.rollback()
        logger.exception("db_task_failed")
        raise
    finally:
        session.close()

