"""harden payment lifecycle

Revision ID: c8d3e1f5a7b2
Revises: f2a8c6d9e4b1
Create Date: 2026-08-10 13:15:00.000000
"""

from typing import Optional, Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c8d3e1f5a7b2"
down_revision: Union[str, None] = "f2a8c6d9e4b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("subscriptions", sa.Column("cancelled_at", sa.DateTime(), nullable=True))
    op.add_column("subscriptions", sa.Column("external_subscription_id", sa.String(length=128), nullable=True))
    op.create_index(
        "ix_subscriptions_provider_external",
        "subscriptions",
        ["provider", "external_subscription_id"],
    )

    op.add_column(
        "payments",
        sa.Column("currency", sa.String(length=3), server_default="UZS", nullable=False),
    )
    op.add_column(
        "payments",
        sa.Column("status", sa.String(length=16), server_default="pending", nullable=False),
    )
    op.add_column("payments", sa.Column("idempotency_key", sa.String(length=64), nullable=True))
    op.drop_index("ix_payments_provider_txn", table_name="payments")
    op.create_unique_constraint("uq_payments_provider_txn", "payments", ["provider", "provider_txn_id"])
    op.create_unique_constraint("uq_payments_user_idempotency", "payments", ["user_id", "idempotency_key"])
    op.alter_column("payments", "currency", server_default=None)
    op.alter_column("payments", "status", server_default=None)


def downgrade() -> None:
    op.drop_constraint("uq_payments_user_idempotency", "payments", type_="unique")
    op.drop_constraint("uq_payments_provider_txn", "payments", type_="unique")
    op.create_index("ix_payments_provider_txn", "payments", ["provider", "provider_txn_id"])
    op.drop_column("payments", "idempotency_key")
    op.drop_column("payments", "status")
    op.drop_column("payments", "currency")
    op.drop_index("ix_subscriptions_provider_external", table_name="subscriptions")
    op.drop_column("subscriptions", "external_subscription_id")
    op.drop_column("subscriptions", "cancelled_at")
