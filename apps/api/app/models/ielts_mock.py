"""IELTS Full Mock — one timed sitting across all four skills.

A MockSession is the exam attempt; its four MockLegs (listening, reading,
writing, speaking) track each skill's own progress and band. Each finished
leg also writes a normal IeltsResult row (see models/ielts.py), tagged with
this session's id via IeltsResult.mock_session_id, so the existing band
history/best-band UI on the IELTS hub needs no changes to include mock
attempts alongside standalone practice.

The Speaking leg doesn't duplicate any state here beyond a session-id
pointer — it drives an actual CoachSession(mode="ielts_full") through the
existing /coach/* endpoints; see models/coach.py.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utcnow
from app.db.base import Base

MOCK_SKILLS = ("listening", "reading", "writing", "speaking")


class MockSession(Base):
    """One full-mock attempt. `current_leg` is null once `status` is no longer
    in_progress (finished normally or abandoned)."""

    __tablename__ = "ielts_mock_sessions"
    __table_args__ = (Index("ix_ielts_mock_sessions_user_started", "user_id", "started_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    track: Mapped[str] = mapped_column(String(12), default="academic", nullable=False)
    status: Mapped[str] = mapped_column(
        String(12), default="in_progress", nullable=False
    )  # in_progress|finished|abandoned
    current_leg: Mapped[Optional[str]] = mapped_column(String(12), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    overall_band: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    band_listening: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    band_reading: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    band_writing: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    band_speaking: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    legs: Mapped[List["MockLeg"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="MockLeg.id",
        lazy="selectin",
    )


class MockLeg(Base):
    """One skill's progress within a MockSession. `detail_json` holds
    skill-specific working state while in_progress and the finalized detail
    once done — shape varies by `skill`:
      listening: {"section": 1-4, "test_ids": [...], "correct": n, "total": n}
      reading:   {"bank_test_id": "...", "passage": 1-3, "correct": n, "total": n}
      writing:   {"task1": {...}, "task2": {...}}
      speaking:  {"coach_session_id": "..."}
    """

    __tablename__ = "ielts_mock_legs"
    __table_args__ = (
        UniqueConstraint("session_id", "skill", name="uq_mock_leg_session_skill"),
        Index("ix_mock_legs_session", "session_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("ielts_mock_sessions.id", ondelete="CASCADE"), nullable=False
    )
    skill: Mapped[str] = mapped_column(String(12), nullable=False)
    status: Mapped[str] = mapped_column(String(12), default="pending", nullable=False)  # pending|in_progress|done
    band: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    detail_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    session: Mapped[MockSession] = relationship(back_populates="legs")
