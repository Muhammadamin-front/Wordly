"""add FSRS stability/difficulty columns

Revision ID: b4d8f1a6c3e9
Revises: a1c4e7f9b3d6
Create Date: 2026-08-21 15:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b4d8f1a6c3e9"
down_revision: Union[str, None] = "a1c4e7f9b3d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "cards", sa.Column("stability", sa.Float(), nullable=False, server_default="0")
    )
    op.add_column(
        "cards", sa.Column("difficulty", sa.Float(), nullable=False, server_default="0")
    )
    # Distinct from due_at (when it's next scheduled): FSRS's forgetting-curve
    # math needs elapsed time since the card was actually last opened, and
    # unlike updated_at this is never bumped by an unrelated edit (favoriting,
    # a memory note) to the same row.
    op.add_column("cards", sa.Column("last_reviewed_at", sa.DateTime(), nullable=True))
    op.add_column("review_logs", sa.Column("stability_before", sa.Float(), nullable=True))
    op.add_column("review_logs", sa.Column("stability_after", sa.Float(), nullable=True))
    op.add_column("review_logs", sa.Column("difficulty_before", sa.Float(), nullable=True))
    op.add_column("review_logs", sa.Column("difficulty_after", sa.Float(), nullable=True))

    # One-time carry-over for cards already in SM-2's hands: a brand-new card
    # (never reviewed) gets stability/difficulty from its first real FSRS
    # review, same as today. A card already mid-review needs an approximate
    # starting point instead of losing progress outright — the existing
    # interval is a reasonable stand-in for "days of memory strength", and
    # ease_factor (1.3 hardest .. 3.0 easiest) inverts onto FSRS difficulty
    # (1 easiest .. 10 hardest) on the same linear scale.
    op.execute(
        """
        UPDATE cards
        SET stability = GREATEST(interval_days, 0.1),
            difficulty = LEAST(10.0, GREATEST(1.0,
                10.0 - (ease_factor - 1.3) / (3.0 - 1.3) * 9.0
            )),
            last_reviewed_at = CASE
                WHEN interval_days > 0 THEN due_at - (interval_days * INTERVAL '1 day')
                ELSE due_at
            END
        WHERE srs_state != 'new'
        """
    )


def downgrade() -> None:
    op.drop_column("review_logs", "difficulty_after")
    op.drop_column("review_logs", "difficulty_before")
    op.drop_column("review_logs", "stability_after")
    op.drop_column("review_logs", "stability_before")
    op.drop_column("cards", "last_reviewed_at")
    op.drop_column("cards", "difficulty")
    op.drop_column("cards", "stability")
