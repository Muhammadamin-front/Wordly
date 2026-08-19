"""add Telegram sign in

Revision ID: a1c4e7f9b3d6
Revises: f7b3c8e1a2d5
Create Date: 2026-08-19 21:15:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1c4e7f9b3d6"
down_revision: Union[str, None] = "f7b3c8e1a2d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("telegram_id", sa.String(length=64), nullable=True))
    op.create_unique_constraint("uq_users_telegram_id", "users", ["telegram_id"])


def downgrade() -> None:
    op.drop_constraint("uq_users_telegram_id", "users", type_="unique")
    op.drop_column("users", "telegram_id")
