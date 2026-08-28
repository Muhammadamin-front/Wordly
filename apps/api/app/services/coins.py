"""Coin wallet — credit/debit with an append-only ledger.

Mirrors the check-then-consume shape of services.ai_quota rather than
subscriptions.grant's binary model: coins are spent per action, not granted
as a time window. Takes a raw user_id (not a User row), matching
subscriptions.grant's pattern — the payment-provider callbacks that credit
coins only ever have a user_id on hand, not a loaded User.
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import CoinTransaction, Wallet


class InsufficientCoins(Exception):
    """Raised by debit() when the wallet balance is below the requested amount."""

    def __init__(self, balance: int, requested: int):
        self.balance = balance
        self.requested = requested
        super().__init__(f"balance {balance} < requested {requested}")


async def _get_or_create_wallet(db: AsyncSession, user_id: UUID) -> Wallet:
    wallet = await db.scalar(select(Wallet).where(Wallet.user_id == user_id))
    if wallet is None:
        wallet = Wallet(user_id=user_id, balance=0)
        db.add(wallet)
        await db.flush()
    return wallet


async def balance(db: AsyncSession, user_id: UUID) -> int:
    wallet = await db.scalar(select(Wallet).where(Wallet.user_id == user_id))
    return wallet.balance if wallet else 0


async def credit(
    db: AsyncSession, user_id: UUID, amount: int, reason: str, reference: Optional[str] = None
) -> int:
    """Add coins (e.g. after a coin-pack purchase). Returns the new balance."""
    if amount <= 0:
        raise ValueError("credit amount must be positive")
    wallet = await _get_or_create_wallet(db, user_id)
    wallet.balance += amount
    db.add(
        CoinTransaction(
            user_id=user_id, delta=amount, reason=reason, reference=reference,
            balance_after=wallet.balance,
        )
    )
    await db.flush()
    return wallet.balance


async def debit(
    db: AsyncSession, user_id: UUID, amount: int, reason: str, reference: Optional[str] = None
) -> int:
    """Spend coins. Raises InsufficientCoins (no partial debit) if the wallet
    can't cover it. Returns the new balance on success."""
    if amount <= 0:
        raise ValueError("debit amount must be positive")
    wallet = await _get_or_create_wallet(db, user_id)
    if wallet.balance < amount:
        raise InsufficientCoins(wallet.balance, amount)
    wallet.balance -= amount
    db.add(
        CoinTransaction(
            user_id=user_id, delta=-amount, reason=reason, reference=reference,
            balance_after=wallet.balance,
        )
    )
    await db.flush()
    return wallet.balance
