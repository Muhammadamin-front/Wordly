"""AI Speaking Coach — voice conversation practice with character tutors.

A session is one conversation with a character (Gordon, Mochi, Alex, or the
IELTS Examiner). Every user turn is graded for grammar/word-choice, and IELTS
sessions can be scored into a band report. Per-character "friendship" progress
gives the relationship a sense of continuity across sessions.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utcnow
from app.db.base import Base


class CoachSession(Base):
    """One conversation with a character. `mode` is chat|ielts; ielts sessions
    carry a part (1|2|3) and can be scored into an IeltsReport."""

    __tablename__ = "coach_sessions"
    __table_args__ = (Index("ix_coach_sessions_user_started", "user_id", "started_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    character: Mapped[str] = mapped_column(String(20), nullable=False)  # gordon|mochi|alex|examiner
    mode: Mapped[str] = mapped_column(String(10), default="chat", nullable=False)  # chat|ielts
    ielts_part: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1|2|3
    topic: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    status: Mapped[str] = mapped_column(String(10), default="active", nullable=False)  # active|done
    turns: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # user turns taken
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    messages: Mapped[List["CoachMessage"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="CoachMessage.created_at",
        lazy="selectin",
    )
    report: Mapped[Optional["IeltsReport"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", uselist=False, lazy="selectin"
    )


class CoachMessage(Base):
    """One turn in a conversation. User turns may carry grammar corrections
    (JSON) surfaced inline in the UI and mined into CoachGrammarError rows."""

    __tablename__ = "coach_messages"
    __table_args__ = (Index("ix_coach_messages_session", "session_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("coach_sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(10), nullable=False)  # user|assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # JSON list of {original, correction, explanation, category} for user turns.
    corrections_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    session: Mapped[CoachSession] = relationship(back_populates="messages")


class CoachGrammarError(Base):
    """A single mistake the learner made, mined from a graded turn. Powers the
    'mistakes to review' list on the coach dashboard."""

    __tablename__ = "coach_grammar_errors"
    __table_args__ = (Index("ix_coach_errors_user_created", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("coach_sessions.id", ondelete="CASCADE"), nullable=False
    )
    original: Mapped[str] = mapped_column(String(300), nullable=False)
    correction: Mapped[str] = mapped_column(String(300), nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    category: Mapped[str] = mapped_column(String(30), default="grammar", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class IeltsReport(Base):
    """Band scoring for an IELTS-mode session across the four speaking criteria.
    Pronunciation is estimated from the transcript (text-only v1) — see service."""

    __tablename__ = "coach_ielts_reports"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("coach_sessions.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    band_overall: Mapped[float] = mapped_column(Float, nullable=False)
    fluency: Mapped[float] = mapped_column(Float, nullable=False)
    lexical: Mapped[float] = mapped_column(Float, nullable=False)
    grammar: Mapped[float] = mapped_column(Float, nullable=False)
    pronunciation: Mapped[float] = mapped_column(Float, nullable=False)
    strengths: Mapped[str] = mapped_column(Text, nullable=False)
    improvements: Mapped[str] = mapped_column(Text, nullable=False)
    homework: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    session: Mapped[CoachSession] = relationship(back_populates="report")


class CharacterProgress(Base):
    """Per-user, per-character relationship. friendship_xp accrues each turn and
    unlocks friendship levels (a light-touch bond meter), independent of the
    global XP/level system."""

    __tablename__ = "coach_character_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "character", name="uq_coach_progress_user_char"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    character: Mapped[str] = mapped_column(String(20), nullable=False)
    sessions_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    messages_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    friendship_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
