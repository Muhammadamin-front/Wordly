"""IELTS exam date on the profile

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-09-03 09:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e2f3a4b5c6d7"
down_revision: Union[str, None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable and unbackfilled: only IELTS-track learners have one, and the
    # goal strip simply omits the countdown when it is absent.
    op.add_column("profiles", sa.Column("exam_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("profiles", "exam_date")
