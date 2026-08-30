"""add Apple sign in

Revision ID: e1a7d5c4b3f2
Revises: b7c2a6e19d41
Create Date: 2026-08-09 12:00:00.000000
"""

from typing import Optional, Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e1a7d5c4b3f2"
down_revision: Union[str, None] = "b7c2a6e19d41"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("apple_id", sa.String(length=255), nullable=True))
    op.create_unique_constraint("uq_users_apple_id", "users", ["apple_id"])


def downgrade() -> None:
    op.drop_constraint("uq_users_apple_id", "users", type_="unique")
    op.drop_column("users", "apple_id")
