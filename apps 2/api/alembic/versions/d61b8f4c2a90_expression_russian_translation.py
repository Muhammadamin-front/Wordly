"""expression russian translation

Revision ID: d61b8f4c2a90
Revises: 7c2f1a8e4d90
Create Date: 2026-08-01 12:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d61b8f4c2a90"
down_revision: Union[str, None] = "7c2f1a8e4d90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("expressions", sa.Column("russian", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("expressions", "russian")
