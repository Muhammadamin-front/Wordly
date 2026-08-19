"""add GitHub sign in

Revision ID: f7b3c8e1a2d5
Revises: ae8d6c25c5cd
Create Date: 2026-08-19 20:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f7b3c8e1a2d5"
down_revision: Union[str, None] = "ae8d6c25c5cd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("github_id", sa.String(length=64), nullable=True))
    op.create_unique_constraint("uq_users_github_id", "users", ["github_id"])


def downgrade() -> None:
    op.drop_constraint("uq_users_github_id", "users", type_="unique")
    op.drop_column("users", "github_id")
