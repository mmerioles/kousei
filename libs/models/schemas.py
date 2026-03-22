from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class DeviceBase(BaseModel):
    hostname: str
    mgmt_ip: str
    vendor: str
    platform: str
    credentials_ref: str | None = None
    polling_interval: int = Field(default=300, ge=30)
    enabled: bool = True


class DeviceCreate(DeviceBase):
    username: str
    password: str = Field(min_length=1)


class DeviceUpdate(BaseModel):
    hostname: str | None = None
    mgmt_ip: str | None = None
    vendor: str | None = None
    platform: str | None = None
    credentials_ref: str | None = None
    polling_interval: int | None = Field(default=None, ge=30)
    enabled: bool | None = None
    username: str | None = None
    password: str | None = None


class DeviceRead(DeviceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    last_seen: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None


class SnapshotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: int
    collected_at: datetime
    cause: str
    config_hash: str
    raw_config_path: str
    normalized_config_path: str


class DiffRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: int
    from_snapshot_id: int | None
    to_snapshot_id: int
    raw_diff: str
    semantic_diff: dict[str, Any]
    summary: str
    risk_score: int
    created_at: datetime


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: int
    occurred_at: datetime
    source: str
    event_type: str
    raw_payload: dict[str, Any]


class AttributionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    diff_id: int
    actor: str
    confidence: int
    evidence: dict[str, Any]
    created_at: datetime


class TimelineEntry(BaseModel):
    timestamp: datetime
    kind: Literal["event", "snapshot", "diff"]
    payload: dict[str, Any]


class CollectRequest(BaseModel):
    cause: Literal["poll", "syslog", "manual"] = "manual"


class OverviewRead(BaseModel):
    device_count: int
    snapshot_count: int
    diff_count: int
    recent_events: list[EventRead]

