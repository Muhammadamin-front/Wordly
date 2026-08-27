"""flag AI-generated words, separate from the review-status meaning

Revision ID: f7c3a8e51b26
Revises: 6d2f8a4c9b10
Create Date: 2026-08-27 08:00:00.000000
"""

from typing import Optional, Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f7c3a8e51b26"
down_revision: Union[str, None] = "6d2f8a4c9b10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "words",
        sa.Column("ai_generated", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("words", "ai_generated")
