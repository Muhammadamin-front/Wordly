import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class Subscription(Base):
    """A user's current entitlement. One active row per user (owner). Family
    members are linked via FamilyMember, not their own subscription."""

    __tablename__ = "subscriptions"
    __table_args__ = (
        Index("ix_subscriptions_user", "user_id"),
        Index("ix_subscriptions_provider_external", "provider", "external_subscription_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    plan_code: Mapped[str] = mapped_column(String(24), nullable=False)
    status: Mapped[str] = mapped_column(String(12), default="active", nullable=False)  # active|canceled|expired
    provider: Mapped[str] = mapped_column(String(12), nullable=False)  # payme|click|sandbox|referral
    seats: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    external_subscription_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )


class FamilyMember(Base):
    __tablename__ = "family_members"
    __table_args__ = (Index("ix_family_members_member", "member_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False
    )
    member_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Payment(Base):
    """One payment order + its gateway transaction. `state` follows Payme's
    machine: 0 pending (order created), 1 created, 2 performed, -1/-2 cancelled.
    Click and Uzum use the same normalized states. Amounts are stored in tiyin
    for exactness; hosted checkout URLs are server-generated and never contain
    a card number or merchant secret."""

    __tablename__ = "payments"
    __table_args__ = (
        Index("ix_payments_user", "user_id"),
        UniqueConstraint("provider", "provider_txn_id", name="uq_payments_provider_txn"),
        UniqueConstraint("user_id", "idempotency_key", name="uq_payments_user_idempotency"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(12), nullable=False)
    plan_code: Mapped[str] = mapped_column(String(24), nullable=False)
    amount_tiyin: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="UZS", nullable=False)
    # Provider-neutral lifecycle; `state` remains for exact Payme/Click protocol replies.
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    state: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    provider_txn_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    checkout_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    create_time_ms: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    perform_time_ms: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    cancel_time_ms: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    cancel_reason: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Wallet(Base):
    """A user's coin balance. One row per user, created lazily on first
    credit/debit (see services.coins) rather than at registration — most
    users will never touch coins."""

    __tablename__ = "wallets"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )


class CoinTransaction(Base):
    """Append-only ledger entry. The balance on Wallet is a derived cache of
    summing these — kept for fast reads, but this table is the source of
    truth for support/audit ("why is my balance X")."""

    __tablename__ = "coin_transactions"
    __table_args__ = (Index("ix_coin_transactions_user_created", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    delta: Mapped[int] = mapped_column(Integer, nullable=False)  # positive=credit, negative=debit
    reason: Mapped[str] = mapped_column(String(32), nullable=False)  # "coin_pack_purchase"|"mock_attempt"|...
    reference: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # e.g. a Payment id
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class VocabularyUnlock(Base):
    """A permanent, one-time unlock of a vocabulary tier (currently just
    "c1_c2") paid for with coins — separate from Subscription because it
    never expires and isn't tied to an active premium period."""

    __tablename__ = "vocabulary_unlocks"
    __table_args__ = (UniqueConstraint("user_id", "tier", name="uq_vocabulary_unlocks_user_tier"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tier: Mapped[str] = mapped_column(String(16), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class VoiceMinutesTransaction(Base):
    """Append-only usage ledger for real-time voice speaking (GPT-5.6 Terra/
    Gemini + ElevenLabs). Deliberately not a Wallet-style balance: the
    monthly allowance resets every calendar month, so "remaining" is
    computed lazily (allowance - sum of this month's rows) rather than
    stored — nothing to reset via a cron job, nothing to get out of sync.

    `seconds` must always come from the server's own measurement of the
    actual STT input + TTS output audio for that turn — NEVER a
    client-reported duration (see services.voice_minutes.debit)."""

    __tablename__ = "voice_minutes_transactions"
    __table_args__ = (Index("ix_voice_minutes_transactions_user_created", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    seconds: Mapped[int] = mapped_column(Integer, nullable=False)  # always positive; a debit-only ledger
    reason: Mapped[str] = mapped_column(String(32), nullable=False)  # "coach_turn"|"coin_purchase"|...
    reference: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # e.g. a CoachSession id
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Referral(Base):
    __tablename__ = "referrals"
    __table_args__ = (Index("ix_referrals_referrer", "referrer_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    referrer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    referee_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    rewarded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
