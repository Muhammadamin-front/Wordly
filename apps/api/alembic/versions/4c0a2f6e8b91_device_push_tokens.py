"""device push tokens

Revision ID: 4c0a2f6e8b91
Revises: e2a9c6b7d4f1
Create Date: 2026-08-24 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4c0a2f6e8b91"
down_revision: Union[str, None] = "e2a9c6b7d4f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "device_push_tokens",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("provider", sa.String(length=16), nullable=False),
        sa.Column("platform", sa.String(length=16), nullable=False),
        sa.Column("token", sa.String(length=512), nullable=False),
        sa.Column("app_version", sa.String(length=40), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider", "token", name="uq_device_push_tokens_provider_token"),
    )
    op.create_index("ix_device_push_tokens_user", "device_push_tokens", ["user_id"])
    op.create_index(
        "ix_device_push_tokens_user_active",
        "device_push_tokens",
        ["user_id", "is_active"],
    )


def downgrade() -> None:
    op.drop_index("ix_device_push_tokens_user_active", table_name="device_push_tokens")
    op.drop_index("ix_device_push_tokens_user", table_name="device_push_tokens")
    op.drop_table("device_push_tokens")
