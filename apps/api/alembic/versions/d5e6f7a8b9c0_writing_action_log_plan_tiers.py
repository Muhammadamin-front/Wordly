"""writing action log + Plus/Pro/Max plan tiers

Replaces premium_monthly/quarterly/yearly and speaking_pro_monthly/
quarterly/yearly with plus_*/pro_*/max_* everywhere a Subscription
currently holds one of the old codes as its *live* entitlement — Payment
history rows are left untouched (they are a receipt of what was actually
charged at the time, not a current entitlement to remap).

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-08-30 12:40:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d5e6f7a8b9c0"
down_revision: Union[str, None] = "c4d5e6f7a8b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# old plan_code -> new plan_code. Both directions used by upgrade/downgrade.
_PLAN_CODE_RENAME = {
    "premium_monthly": "plus_monthly",
    "premium_quarterly": "plus_quarterly",
    "premium_yearly": "plus_yearly",
    "speaking_pro_monthly": "pro_monthly",
    "speaking_pro_quarterly": "pro_quarterly",
    "speaking_pro_yearly": "pro_yearly",
}


def upgrade() -> None:
    op.create_table(
        "writing_action_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("kind", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_writing_action_logs_user_created",
        "writing_action_logs",
        ["user_id", "created_at"],
    )

    conn = op.get_bind()
    for old_code, new_code in _PLAN_CODE_RENAME.items():
        conn.execute(
            sa.text("UPDATE subscriptions SET plan_code = :new WHERE plan_code = :old"),
            {"new": new_code, "old": old_code},
        )


def downgrade() -> None:
    conn = op.get_bind()
    for old_code, new_code in _PLAN_CODE_RENAME.items():
        conn.execute(
            sa.text("UPDATE subscriptions SET plan_code = :old WHERE plan_code = :new"),
            {"old": old_code, "new": new_code},
        )

    op.drop_index("ix_writing_action_logs_user_created", table_name="writing_action_logs")
    op.drop_table("writing_action_logs")
