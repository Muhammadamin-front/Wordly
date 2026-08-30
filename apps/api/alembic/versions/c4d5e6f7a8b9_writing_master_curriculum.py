"""writing master curriculum: target band goal + progress sync

Revision ID: c4d5e6f7a8b9
Revises: b2c3d4e5f6a7
Create Date: 2026-08-30 10:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "profiles",
        sa.Column("target_band_score", sa.Float(), nullable=True),
    )

    op.create_table(
        "writing_master_progress",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("unit_slug", sa.String(length=40), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("best_score", sa.Integer(), nullable=False),
        sa.Column("last_score", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("attempts >= 1", name="ck_writing_master_progress_attempts_positive"),
        sa.CheckConstraint("best_score BETWEEN 0 AND 100", name="ck_writing_master_progress_best_score"),
        sa.CheckConstraint("last_score BETWEEN 0 AND 100", name="ck_writing_master_progress_last_score"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "unit_slug"),
    )
    op.create_index(
        "ix_writing_master_progress_user_updated",
        "writing_master_progress",
        ["user_id", "updated_at"],
    )

    op.create_table(
        "writing_master_attempt_receipts",
        sa.Column("attempt_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("unit_slug", sa.String(length=40), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("attempt_id"),
    )
    op.create_index(
        "ix_writing_master_attempt_receipts_user_created",
        "writing_master_attempt_receipts",
        ["user_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_writing_master_attempt_receipts_user_created", table_name="writing_master_attempt_receipts")
    op.drop_table("writing_master_attempt_receipts")
    op.drop_index("ix_writing_master_progress_user_updated", table_name="writing_master_progress")
    op.drop_table("writing_master_progress")
    op.drop_column("profiles", "target_band_score")
