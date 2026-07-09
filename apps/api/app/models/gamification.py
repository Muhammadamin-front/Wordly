import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base
from app.services.leveling import DEFAULT_DAILY_GOAL


class UserStats(Base):
    """One row per user — the denormalized gamification counters. Created
    lazily on first review (see services.gamification.get_or_create_stats)."""

    __tablename__ = "user_stats"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    coins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_on: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    streak_freezes: Mapped[int] = mapped_column(Integer, default=2, nullable=False)

    daily_goal: Mapped[int] = mapped_column(Integer, default=DEFAULT_DAILY_GOAL, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )


class DailyActivity(Base):
    """One row per user per local day. Powers streaks, the daily goal, and the
    M5 statistics heatmap. Append-friendly: only the current day is mutated."""

    __tablename__ = "daily_activity"
    __table_args__ = (
        UniqueConstraint("user_id", "day", name="uq_daily_activity_user_day"),
        Index("ix_daily_activity_user_day", "user_id", "day"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    day: Mapped[date] = mapped_column(Date, nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    goal_reached: Mapped[bool] = mapped_column(default=False, nullable=False)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (
        UniqueConstraint("user_id", "code", name="uq_user_achievement"),
        Index("ix_user_achievements_user", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    code: Mapped[str] = mapped_column(String(40), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class LeagueEntry(Base):
    """A user's participation in one weekly league. Tier + group are assigned
    when the entry is created; xp accumulates through the week. Promotion and
    relegation are computed lazily from the previous week when the next entry
    is created (see services.leagues)."""

    __tablename__ = "league_entries"
    __table_args__ = (
        UniqueConstraint("user_id", "iso_week", name="uq_league_entry_user_week"),
        Index("ix_league_group", "iso_week", "tier_index", "league_group", "xp"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    iso_week: Mapped[str] = mapped_column(String(8), nullable=False)  # e.g. "2026-W28"
    tier_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    league_group: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
