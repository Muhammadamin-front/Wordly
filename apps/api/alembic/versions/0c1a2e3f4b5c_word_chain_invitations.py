"""word chain friend invitations

Revision ID: 0c1a2e3f4b5c
Revises: e6f7a8b9c0d1
Create Date: 2026-09-01 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0c1a2e3f4b5c"
down_revision: Union[str, None] = "e6f7a8b9c0d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "word_chain_invitations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("sender_id", sa.Uuid(), nullable=False),
        sa.Column("recipient_id", sa.Uuid(), nullable=False),
        sa.Column("room_code", sa.String(length=6), nullable=False),
        sa.Column("status", sa.String(length=12), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("responded_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_word_chain_invitations_recipient_status_expires",
        "word_chain_invitations",
        ["recipient_id", "status", "expires_at"],
        unique=False,
    )
    op.create_index(
        "ix_word_chain_invitations_sender",
        "word_chain_invitations",
        ["sender_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_word_chain_invitations_sender", table_name="word_chain_invitations")
    op.drop_index(
        "ix_word_chain_invitations_recipient_status_expires",
        table_name="word_chain_invitations",
    )
    op.drop_table("word_chain_invitations")
