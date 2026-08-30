"""daily quests and game runs

Revision ID: b7c2a6e19d41
Revises: d61b8f4c2a90
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7c2a6e19d41"
down_revision: Union[str, None] = "d61b8f4c2a90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "game_runs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("game_type", sa.String(length=30), nullable=False),
        sa.Column("source_category", sa.String(length=30), nullable=True),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("total_questions", sa.Integer(), nullable=False),
        sa.Column("answered_count", sa.Integer(), nullable=False),
        sa.Column("correct_count", sa.Integer(), nullable=False),
        sa.Column("current_combo", sa.Integer(), nullable=False),
        sa.Column("best_combo", sa.Integer(), nullable=False),
        sa.Column("review_xp", sa.Integer(), nullable=False),
        sa.Column("completion_xp", sa.Integer(), nullable=False),
        sa.Column("card_ids", sa.JSON(), nullable=False),
        sa.Column("answered_card_ids", sa.JSON(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_game_runs_user_day", "game_runs", ["user_id", "day"])
    op.create_index("ix_game_runs_user_created", "game_runs", ["user_id", "created_at"])

    op.create_table(
        "daily_quest_claims",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("code", sa.String(length=40), nullable=False),
        sa.Column("xp_reward", sa.Integer(), nullable=False),
        sa.Column("claimed_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "day", "code", name="uq_daily_quest_claim"),
    )
    op.create_index(
        "ix_daily_quest_claims_user_day", "daily_quest_claims", ["user_id", "day"]
    )


def downgrade() -> None:
    op.drop_index("ix_daily_quest_claims_user_day", table_name="daily_quest_claims")
    op.drop_table("daily_quest_claims")
    op.drop_index("ix_game_runs_user_created", table_name="game_runs")
    op.drop_index("ix_game_runs_user_day", table_name="game_runs")
    op.drop_table("game_runs")
