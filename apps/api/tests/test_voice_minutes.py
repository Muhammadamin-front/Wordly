"""services.voice_minutes — real-time voice usage ledger, no HTTP involved."""
from datetime import datetime, timedelta
from uuid import UUID

import pytest

import app.db.session as db_session
from app.models.billing import VoiceMinutesTransaction
from app.services import voice_minutes
from tests.conftest import register_user

ALLOWANCE = 60 * 60  # Basic: 60 min/month, in seconds


async def _user_id(client, email="voice@words.uz") -> UUID:
    data = await register_user(client, email=email)
    return UUID(data["user"]["id"])


async def test_remaining_is_full_allowance_with_no_usage(client):
    user_id = await _user_id(client)
    async with db_session.get_session_factory()() as db:
        assert await voice_minutes.remaining_seconds(db, user_id, ALLOWANCE) == ALLOWANCE
        assert await voice_minutes.has_seconds(db, user_id, ALLOWANCE)


async def test_debit_reduces_remaining_and_sums_across_many_short_turns(client):
    """Anti-trick property: chopping usage into many small debits sums to
    the same total as one big debit — there's no advantage to fragmenting."""
    user_id = await _user_id(client, email="voice2@words.uz")
    async with db_session.get_session_factory()() as db:
        for _ in range(10):
            await voice_minutes.debit(db, user_id, 30, reason="coach_turn")
        await db.commit()

    async with db_session.get_session_factory()() as db:
        used = await voice_minutes.used_seconds_this_month(db, user_id)
        assert used == 300  # 10 * 30s, not rounded/truncated per-turn
        assert await voice_minutes.remaining_seconds(db, user_id, ALLOWANCE) == ALLOWANCE - 300


async def test_has_seconds_goes_false_once_allowance_is_exhausted(client):
    user_id = await _user_id(client, email="voice3@words.uz")
    async with db_session.get_session_factory()() as db:
        await voice_minutes.debit(db, user_id, ALLOWANCE, reason="coach_turn")
        await db.commit()

    async with db_session.get_session_factory()() as db:
        assert await voice_minutes.remaining_seconds(db, user_id, ALLOWANCE) == 0
        assert not await voice_minutes.has_seconds(db, user_id, ALLOWANCE)


async def test_debit_always_succeeds_even_past_the_allowance(client):
    """debit() is a recorder, not a gate — the real API cost already
    happened by the time it's called, so it must never refuse to log it.
    has_seconds() is what gates the *next* turn, not this one."""
    user_id = await _user_id(client, email="voice4@words.uz")
    async with db_session.get_session_factory()() as db:
        await voice_minutes.debit(db, user_id, ALLOWANCE + 45, reason="coach_turn")
        await db.commit()

    async with db_session.get_session_factory()() as db:
        assert await voice_minutes.used_seconds_this_month(db, user_id) == ALLOWANCE + 45
        assert await voice_minutes.remaining_seconds(db, user_id, ALLOWANCE) == 0


async def test_debit_rejects_non_positive_seconds(client):
    user_id = await _user_id(client, email="voice5@words.uz")
    async with db_session.get_session_factory()() as db:
        with pytest.raises(ValueError):
            await voice_minutes.debit(db, user_id, 0, reason="coach_turn")
        with pytest.raises(ValueError):
            await voice_minutes.debit(db, user_id, -5, reason="coach_turn")


async def test_usage_from_a_previous_month_does_not_count_against_this_month(client):
    """The allowance resets every calendar month — no cron job, no stored
    balance to reset; "remaining" is only ever this month's rows."""
    user_id = await _user_id(client, email="voice6@words.uz")
    async with db_session.get_session_factory()() as db:
        last_month = voice_minutes._month_start() - timedelta(days=1)
        db.add(
            VoiceMinutesTransaction(
                user_id=user_id, seconds=ALLOWANCE, reason="coach_turn", created_at=last_month,
            )
        )
        await db.commit()

    async with db_session.get_session_factory()() as db:
        assert await voice_minutes.remaining_seconds(db, user_id, ALLOWANCE) == ALLOWANCE
        assert await voice_minutes.has_seconds(db, user_id, ALLOWANCE)
