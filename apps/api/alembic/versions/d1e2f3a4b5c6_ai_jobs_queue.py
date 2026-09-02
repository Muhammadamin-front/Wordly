"""background AI job queue

Revision ID: d1e2f3a4b5c6
Revises: 0c1a2e3f4b5c
Create Date: 2026-09-02 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "d1e2f3a4b5c6"
down_revision: Union[str, None] = "0c1a2e3f4b5c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# JSONB on Postgres, JSON elsewhere — mirrors app/models/jobs.py.
json_type = sa.JSON().with_variant(postgresql.JSONB(), "postgresql")


def upgrade() -> None:
    op.create_table(
        "ai_jobs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("kind", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=12), nullable=False),
        sa.Column("payload", json_type, nullable=False),
        sa.Column("result", json_type, nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
    )
    # The worker's claim query.
    op.create_index("ix_ai_jobs_status_created", "ai_jobs", ["status", "created_at"])
    # The per-learner in-flight count enforced at enqueue time.
    op.create_index("ix_ai_jobs_user_status", "ai_jobs", ["user_id", "status"])


def downgrade() -> None:
    op.drop_index("ix_ai_jobs_user_status", table_name="ai_jobs")
    op.drop_index("ix_ai_jobs_status_created", table_name="ai_jobs")
    op.drop_table("ai_jobs")
