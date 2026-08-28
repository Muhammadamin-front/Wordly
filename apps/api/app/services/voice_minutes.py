"""Real-time voice speaking minutes — a usage ledger, not a spendable wallet.

Basic and Speaking Pro each grant N seconds per calendar week (see
plans.VOICE_SECONDS_PER_WEEK). Unlike coins, this never accumulates or
carries over: "remaining" is computed lazily each call by summing this
week's debits against the plan's allowance, so there's no balance to reset
and nothing that can drift out of sync with the ledger.

The window is the calendar week (Monday 00:00 UTC) rather than a rolling
seven days: a learner can see when it refills, and it cannot be walked
forward indefinitely by spacing sessions out the way a rolling window can.

Metering discipline (why this can't be tricked): every debit() call must be
seeded from a duration the backend itself measured — the actual STT input
audio length plus the actual TTS output audio length for that turn, read
back from the provider responses (or the audio bytes) after the real API
call completed. Never from anything the client reports. Chopping a
conversation into many short turns doesn't help a user stretch their
allowance either, since debits are summed continuously by elapsed seconds,
not counted per turn.

has_seconds() is the gate, called BEFORE spending real API money on a turn.
debit() always succeeds once called — the API cost already happened by
then, so refusing to record it would only hide real spend, not undo it.
"""
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.billing import VoiceMinutesTransaction


def _week_start(now: Optional[datetime] = None) -> datetime:
    """Monday 00:00 UTC of the week `now` falls in."""
    now = now or utcnow()
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return midnight - timedelta(days=midnight.weekday())


async def used_seconds_this_week(
    db: AsyncSession, user_id: UUID, *, now: Optional[datetime] = None
) -> int:
    total = await db.scalar(
        select(func.coalesce(func.sum(VoiceMinutesTransaction.seconds), 0)).where(
            VoiceMinutesTransaction.user_id == user_id,
            VoiceMinutesTransaction.created_at >= _week_start(now),
        )
    )
    return int(total or 0)


async def remaining_seconds(
    db: AsyncSession, user_id: UUID, allowance_seconds: int, *, now: Optional[datetime] = None
) -> int:
    used = await used_seconds_this_week(db, user_id, now=now)
    return max(0, allowance_seconds - used)


async def has_seconds(
    db: AsyncSession, user_id: UUID, allowance_seconds: int, minimum: int = 1
) -> bool:
    """Pre-check before starting a turn. Not perfectly race-proof against
    two concurrent turns both passing the check, but a single real-time
    voice conversation is inherently sequential (one turn completes before
    the next starts), so that's not a real exposure in practice."""
    return await remaining_seconds(db, user_id, allowance_seconds) >= minimum


async def debit(
    db: AsyncSession, user_id: UUID, seconds: int, reason: str, reference: Optional[str] = None
) -> None:
    """Record real, server-measured usage after a turn completes. `seconds`
    must be the actual STT + TTS audio duration for that turn — see the
    module docstring. Always succeeds; this is a recorder, not a gate."""
    if seconds <= 0:
        raise ValueError("seconds must be positive")
    db.add(
        VoiceMinutesTransaction(
            user_id=user_id, seconds=seconds, reason=reason, reference=reference,
        )
    )
    await db.flush()
