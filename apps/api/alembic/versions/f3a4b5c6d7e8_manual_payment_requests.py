"""card-transfer payment requests

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-09-03 10:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f3a4b5c6d7e8"
down_revision: Union[str, None] = "e2f3a4b5c6d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "manual_payment_requests",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("plan_code", sa.String(length=24), nullable=False),
        sa.Column("amount_som", sa.Integer(), nullable=False),
        sa.Column("reference", sa.String(length=12), nullable=False, unique=True),
        sa.Column("status", sa.String(length=12), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column(
            "resolved_by", sa.Uuid(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
        ),
    )
    op.create_index(
        "ix_manual_payments_status_created", "manual_payment_requests", ["status", "created_at"]
    )
    op.create_index(
        "ix_manual_payments_user_status", "manual_payment_requests", ["user_id", "status"]
    )


def downgrade() -> None:
    op.drop_index("ix_manual_payments_user_status", table_name="manual_payment_requests")
    op.drop_index("ix_manual_payments_status_created", table_name="manual_payment_requests")
    op.drop_table("manual_payment_requests")
