"""profile onboarding path

Revision ID: 7c2f1a8e4d90
Revises: f3a71d928c4e
Create Date: 2026-08-01 10:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7c2f1a8e4d90"
down_revision: Union[str, None] = "f3a71d928c4e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "profiles",
        sa.Column("cefr_level", sa.String(length=2), server_default="A1", nullable=False),
    )
    op.add_column(
        "profiles",
        sa.Column(
            "learning_goal", sa.String(length=20), server_default="general", nullable=False
        ),
    )
    op.add_column(
        "profiles",
        sa.Column("daily_minutes", sa.Integer(), server_default="10", nullable=False),
    )
    op.add_column(
        "profiles",
        sa.Column(
            "learning_interests",
            sa.JSON(),
            server_default=sa.text("'[]'::json"),
            nullable=False,
        ),
    )
    op.add_column(
        "profiles",
        sa.Column(
            "onboarding_completed", sa.Boolean(), server_default=sa.true(), nullable=False
        ),
    )
    op.add_column(
        "profiles", sa.Column("starter_deck_id", sa.Uuid(), nullable=True)
    )
    op.create_foreign_key(
        "fk_profiles_starter_deck",
        "profiles",
        "decks",
        ["starter_deck_id"],
        ["id"],
        ondelete="SET NULL",
    )
    # Existing accounts keep their current dashboard path. New ORM-created
    # profiles explicitly start with False and enter onboarding.
    op.alter_column(
        "profiles", "onboarding_completed", server_default=sa.false()
    )


def downgrade() -> None:
    op.drop_constraint("fk_profiles_starter_deck", "profiles", type_="foreignkey")
    op.drop_column("profiles", "starter_deck_id")
    op.drop_column("profiles", "onboarding_completed")
    op.drop_column("profiles", "learning_interests")
    op.drop_column("profiles", "daily_minutes")
    op.drop_column("profiles", "learning_goal")
    op.drop_column("profiles", "cefr_level")
