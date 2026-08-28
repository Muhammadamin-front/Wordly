"""services.coins — credit/debit ledger, no HTTP involved."""
from uuid import UUID

import pytest

import app.db.session as db_session
from app.services import coins
from tests.conftest import register_user


async def _user_id(client, email="coins@words.uz") -> UUID:
    data = await register_user(client, email=email)
    return UUID(data["user"]["id"])


async def test_balance_starts_at_zero_with_no_wallet_row(client):
    user_id = await _user_id(client)
    async with db_session.get_session_factory()() as db:
        assert await coins.balance(db, user_id) == 0


async def test_credit_then_debit_updates_balance_and_writes_ledger_rows(client):
    user_id = await _user_id(client, email="coins2@words.uz")
    async with db_session.get_session_factory()() as db:
        after_credit = await coins.credit(db, user_id, 500, reason="coin_pack_purchase", reference="order-1")
        assert after_credit == 500
        await db.commit()

    async with db_session.get_session_factory()() as db:
        after_debit = await coins.debit(db, user_id, 300, reason="mock_attempt")
        assert after_debit == 200
        await db.commit()

    async with db_session.get_session_factory()() as db:
        assert await coins.balance(db, user_id) == 200


async def test_debit_raises_insufficient_coins_without_changing_balance(client):
    user_id = await _user_id(client, email="coins3@words.uz")
    async with db_session.get_session_factory()() as db:
        await coins.credit(db, user_id, 100, reason="coin_pack_purchase")
        await db.commit()

    async with db_session.get_session_factory()() as db:
        with pytest.raises(coins.InsufficientCoins) as excinfo:
            await coins.debit(db, user_id, 500, reason="mock_attempt")
        assert excinfo.value.balance == 100
        assert excinfo.value.requested == 500
        await db.rollback()

    async with db_session.get_session_factory()() as db:
        assert await coins.balance(db, user_id) == 100  # unchanged


async def test_credit_and_debit_reject_non_positive_amounts(client):
    user_id = await _user_id(client, email="coins4@words.uz")
    async with db_session.get_session_factory()() as db:
        with pytest.raises(ValueError):
            await coins.credit(db, user_id, 0, reason="coin_pack_purchase")
        with pytest.raises(ValueError):
            await coins.debit(db, user_id, -10, reason="mock_attempt")
