"""store Uzum hosted checkout URLs

Revision ID: e2a9c6b7d4f1
Revises: 9e1856c1ac3a
Create Date: 2026-08-23 14:20:00.000000
"""

from typing import Optional, Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e2a9c6b7d4f1"
down_revision: Union[str, None] = "9e1856c1ac3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("payments", sa.Column("checkout_url", sa.String(length=2048), nullable=True))


def downgrade() -> None:
    op.drop_column("payments", "checkout_url")
