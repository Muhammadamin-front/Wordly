"""account grammar progress

Revision ID: 6d2f8a4c9b10
Revises: 4c0a2f6e8b91
Create Date: 2026-08-24 10:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6d2f8a4c9b10"
down_revision: Union[str, None] = "4c0a2f6e8b91"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "grammar_progress",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("lesson_slug", sa.String(length=160), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("best_score", sa.Integer(), nullable=False),
        sa.Column("last_score", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("attempts >= 1", name="ck_grammar_progress_attempts_positive"),
        sa.CheckConstraint("best_score BETWEEN 0 AND 100", name="ck_grammar_progress_best_score"),
        sa.CheckConstraint("last_score BETWEEN 0 AND 100", name="ck_grammar_progress_last_score"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "lesson_slug"),
    )
    op.create_index(
        "ix_grammar_progress_user_updated",
        "grammar_progress",
        ["user_id", "updated_at"],
    )
    op.create_table(
        "grammar_attempt_receipts",
        sa.Column("attempt_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("lesson_slug", sa.String(length=160), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("attempt_id"),
    )
    op.create_index(
        "ix_grammar_attempt_receipts_user_created",
        "grammar_attempt_receipts",
        ["user_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_grammar_attempt_receipts_user_created", table_name="grammar_attempt_receipts")
    op.drop_table("grammar_attempt_receipts")
    op.drop_index("ix_grammar_progress_user_updated", table_name="grammar_progress")
    op.drop_table("grammar_progress")
