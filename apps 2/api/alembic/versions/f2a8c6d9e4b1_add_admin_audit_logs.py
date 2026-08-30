"""add admin audit logs

Revision ID: f2a8c6d9e4b1
Revises: e1a7d5c4b3f2
Create Date: 2026-08-10 11:30:00.000000
"""

from typing import Optional, Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f2a8c6d9e4b1"
down_revision: Union[str, None] = "e1a7d5c4b3f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "admin_audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("actor_id", sa.Uuid(), nullable=True),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("target_type", sa.String(length=64), nullable=False),
        sa.Column("target_id", sa.String(length=64), nullable=False),
        sa.Column("previous_value", sa.JSON(), nullable=True),
        sa.Column("new_value", sa.JSON(), nullable=True),
        sa.Column("reason", sa.String(length=500), nullable=True),
        sa.Column("request_id", sa.String(length=64), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_admin_audit_logs_actor_created", "admin_audit_logs", ["actor_id", "created_at"]
    )
    op.create_index(
        "ix_admin_audit_logs_target_created",
        "admin_audit_logs",
        ["target_type", "target_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_admin_audit_logs_target_created", table_name="admin_audit_logs")
    op.drop_index("ix_admin_audit_logs_actor_created", table_name="admin_audit_logs")
    op.drop_table("admin_audit_logs")
