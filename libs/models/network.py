from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from libs.models.database import Base


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hostname: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    mgmt_ip: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    vendor: Mapped[str] = mapped_column(String(64))
    platform: Mapped[str] = mapped_column(String(64))
    username: Mapped[str] = mapped_column(String(255))
    password_encrypted: Mapped[str] = mapped_column(Text)
    credentials_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    polling_interval: Mapped[int] = mapped_column(Integer, default=300)
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    snapshots: Mapped[list[Snapshot]] = relationship(back_populates="device", cascade="all, delete-orphan")
    events: Mapped[list[Event]] = relationship(back_populates="device", cascade="all, delete-orphan")
    diffs: Mapped[list[Diff]] = relationship(back_populates="device", cascade="all, delete-orphan")


class Snapshot(Base):
    __tablename__ = "snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    cause: Mapped[str] = mapped_column(String(32))
    config_hash: Mapped[str] = mapped_column(String(64), index=True)
    raw_config_path: Mapped[str] = mapped_column(Text)
    normalized_config_path: Mapped[str] = mapped_column(Text)

    device: Mapped[Device] = relationship(back_populates="snapshots")
    from_diffs: Mapped[list[Diff]] = relationship(
        foreign_keys="Diff.from_snapshot_id", back_populates="from_snapshot"
    )
    to_diffs: Mapped[list[Diff]] = relationship(
        foreign_keys="Diff.to_snapshot_id", back_populates="to_snapshot"
    )


class Diff(Base):
    __tablename__ = "diffs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    from_snapshot_id: Mapped[int | None] = mapped_column(
        ForeignKey("snapshots.id", ondelete="SET NULL"), nullable=True
    )
    to_snapshot_id: Mapped[int] = mapped_column(ForeignKey("snapshots.id", ondelete="CASCADE"), unique=True)
    raw_diff: Mapped[str] = mapped_column(Text)
    semantic_diff: Mapped[dict[str, Any]] = mapped_column(JSONB().with_variant(JSON(), "sqlite"))
    summary: Mapped[str] = mapped_column(Text)
    risk_score: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    device: Mapped[Device] = relationship(back_populates="diffs")
    from_snapshot: Mapped[Snapshot | None] = relationship(
        foreign_keys=[from_snapshot_id], back_populates="from_diffs"
    )
    to_snapshot: Mapped[Snapshot] = relationship(foreign_keys=[to_snapshot_id], back_populates="to_diffs")
    attributions: Mapped[list[Attribution]] = relationship(
        back_populates="diff", cascade="all, delete-orphan"
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    source: Mapped[str] = mapped_column(String(32))
    event_type: Mapped[str] = mapped_column(String(64), index=True)
    raw_payload: Mapped[dict[str, Any]] = mapped_column(JSONB().with_variant(JSON(), "sqlite"))

    device: Mapped[Device] = relationship(back_populates="events")


class Attribution(Base):
    __tablename__ = "attributions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    diff_id: Mapped[int] = mapped_column(ForeignKey("diffs.id", ondelete="CASCADE"), index=True)
    actor: Mapped[str] = mapped_column(String(255))
    confidence: Mapped[int] = mapped_column(Integer)
    evidence: Mapped[dict[str, Any]] = mapped_column(JSONB().with_variant(JSON(), "sqlite"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    diff: Mapped[Diff] = relationship(back_populates="attributions")

