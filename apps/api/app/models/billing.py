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
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class Subscription(Base):
    """A user's current entitlement. One active row per user (owner). Family
    members are linked via FamilyMember, not their own subscription."""

    __tablename__ = "subscriptions"
    __table_args__ = (Index("ix_subscriptions_user", "user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    plan_code: Mapped[str] = mapped_column(String(24), nullable=False)
    status: Mapped[str] = mapped_column(String(12), default="active", nullable=False)  # active|canceled|expired
    provider: Mapped[str] = mapped_column(String(12), nullable=False)  # payme|click|sandbox|referral
    seats: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
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
    Click reuses 0/1/2/-1. Amounts stored in tiyin for exactness."""

    __tablename__ = "payments"
    __table_args__ = (
        Index("ix_payments_user", "user_id"),
        Index("ix_payments_provider_txn", "provider", "provider_txn_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(12), nullable=False)
    plan_code: Mapped[str] = mapped_column(String(24), nullable=False)
    amount_tiyin: Mapped[int] = mapped_column(BigInteger, nullable=False)
    state: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    provider_txn_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    create_time_ms: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    perform_time_ms: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    cancel_time_ms: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    cancel_reason: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
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
