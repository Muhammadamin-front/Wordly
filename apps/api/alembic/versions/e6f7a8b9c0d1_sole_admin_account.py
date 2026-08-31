"""grant super_admin to the sole admin account

Idempotent data migration: promotes the one account allowed to hold admin/
super_admin (Settings.SOLE_ADMIN_EMAIL, hardcoded in app.core.config
rather than read from the DB here — this migration must keep working even
if that setting's default ever changes later) to super_admin. A no-op if
that account doesn't exist yet in this environment (local/CI databases
have no such user); production has the real account.

Revision ID: e6f7a8b9c0d1
Revises: d5e6f7a8b9c0
Create Date: 2026-08-31 09:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e6f7a8b9c0d1"
down_revision: Union[str, None] = "d5e6f7a8b9c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SOLE_ADMIN_EMAIL = "berdullayev@gmail.com"


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE users SET role = 'super_admin' WHERE lower(email) = lower(:email)"),
        {"email": SOLE_ADMIN_EMAIL},
    )


def downgrade() -> None:
    # Deliberately not reversed: downgrading this migration should not
    # strip admin access from the one account allowed to have it.
    pass
