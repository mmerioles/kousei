from sqlalchemy.orm import Session

from libs.models.database import get_db


def db_session() -> Session:
    return next(get_db())

