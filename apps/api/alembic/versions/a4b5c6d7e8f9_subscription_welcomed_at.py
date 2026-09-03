"""announce a newly active subscription once

Revision ID: a4b5c6d7e8f9
Revises: f3a4b5c6d7e8
Create Date: 2026-09-03 11:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a4b5c6d7e8f9"
down_revision: Union[str, None] = "f3a4b5c6d7e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("subscriptions", sa.Column("welcomed_at", sa.DateTime(), nullable=True))
    # Existing subscribers already know they are premium; only announce it to
    # people whose subscription starts after this ships.
    op.execute("UPDATE subscriptions SET welcomed_at = started_at")


def downgrade() -> None:
    op.drop_column("subscriptions", "welcomed_at")
