import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utcnow
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    # Null for OAuth-only accounts.
    password_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    apple_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    referral_code: Mapped[Optional[str]] = mapped_column(String(12), unique=True, nullable=True)
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    role: Mapped[str] = mapped_column(
        String(16), default="learner", nullable=False
    )  # learner|teacher|support|content_manager|admin|super_admin
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )

    profile: Mapped["Profile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="joined"
    )

    @property
    def email_verified(self) -> bool:
        return self.email_verified_at is not None


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    display_name: Mapped[str] = mapped_column(String(80), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    ui_locale: Mapped[str] = mapped_column(String(5), default="uz", nullable=False)  # uz|ru|en
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Tashkent", nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    cefr_level: Mapped[str] = mapped_column(String(2), default="A1", nullable=False)
    learning_goal: Mapped[str] = mapped_column(String(20), default="general", nullable=False)
    daily_minutes: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    learning_interests: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    starter_deck_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("decks.id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped[User] = relationship(back_populates="profile")


class RefreshToken(Base):
    """Rotating refresh sessions. Rows are never deleted within TTL —
    a revoked-but-presented token is how we detect theft (reuse)."""

    __tablename__ = "refresh_tokens"
    __table_args__ = (Index("ix_refresh_tokens_user_id", "user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    replaced_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class OneTimeToken(Base):
    """Email verification and password reset tokens (hashed, single-use)."""

    __tablename__ = "one_time_tokens"
    __table_args__ = (Index("ix_one_time_tokens_user_id", "user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    purpose: Mapped[str] = mapped_column(String(20), nullable=False)  # verify_email|reset_password
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
