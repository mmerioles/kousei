"""initial schema

Revision ID: 20260322_0001
Revises:
Create Date: 2026-03-22 00:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260322_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "devices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("hostname", sa.String(length=255), nullable=False),
        sa.Column("mgmt_ip", sa.String(length=64), nullable=False),
        sa.Column("vendor", sa.String(length=64), nullable=False),
        sa.Column("platform", sa.String(length=64), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=False),
        sa.Column("password_encrypted", sa.Text(), nullable=False),
        sa.Column("credentials_ref", sa.String(length=255), nullable=True),
        sa.Column("polling_interval", sa.Integer(), nullable=False, server_default="300"),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_devices_hostname", "devices", ["hostname"], unique=True)
    op.create_index("ix_devices_mgmt_ip", "devices", ["mgmt_ip"], unique=True)

    op.create_table(
        "snapshots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("device_id", sa.Integer(), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("collected_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("cause", sa.String(length=32), nullable=False),
        sa.Column("config_hash", sa.String(length=64), nullable=False),
        sa.Column("raw_config_path", sa.Text(), nullable=False),
        sa.Column("normalized_config_path", sa.Text(), nullable=False),
    )
    op.create_index("ix_snapshots_device_id", "snapshots", ["device_id"], unique=False)
    op.create_index("ix_snapshots_collected_at", "snapshots", ["collected_at"], unique=False)
    op.create_index("ix_snapshots_config_hash", "snapshots", ["config_hash"], unique=False)

    op.create_table(
        "diffs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("device_id", sa.Integer(), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("from_snapshot_id", sa.Integer(), sa.ForeignKey("snapshots.id", ondelete="SET NULL"), nullable=True),
        sa.Column("to_snapshot_id", sa.Integer(), sa.ForeignKey("snapshots.id", ondelete="CASCADE"), nullable=False),
        sa.Column("raw_diff", sa.Text(), nullable=False),
        sa.Column("semantic_diff", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_diffs_device_id", "diffs", ["device_id"], unique=False)
    op.create_unique_constraint("uq_diffs_to_snapshot_id", "diffs", ["to_snapshot_id"])

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("device_id", sa.Integer(), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    )
    op.create_index("ix_events_device_id", "events", ["device_id"], unique=False)
    op.create_index("ix_events_occurred_at", "events", ["occurred_at"], unique=False)
    op.create_index("ix_events_event_type", "events", ["event_type"], unique=False)

    op.create_table(
        "attributions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("diff_id", sa.Integer(), sa.ForeignKey("diffs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("actor", sa.String(length=255), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column("evidence", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_attributions_diff_id", "attributions", ["diff_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_attributions_diff_id", table_name="attributions")
    op.drop_table("attributions")
    op.drop_index("ix_events_event_type", table_name="events")
    op.drop_index("ix_events_occurred_at", table_name="events")
    op.drop_index("ix_events_device_id", table_name="events")
    op.drop_table("events")
    op.drop_constraint("uq_diffs_to_snapshot_id", "diffs", type_="unique")
    op.drop_index("ix_diffs_device_id", table_name="diffs")
    op.drop_table("diffs")
    op.drop_index("ix_snapshots_config_hash", table_name="snapshots")
    op.drop_index("ix_snapshots_collected_at", table_name="snapshots")
    op.drop_index("ix_snapshots_device_id", table_name="snapshots")
    op.drop_table("snapshots")
    op.drop_index("ix_devices_mgmt_ip", table_name="devices")
    op.drop_index("ix_devices_hostname", table_name="devices")
    op.drop_table("devices")

