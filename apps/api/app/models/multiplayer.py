import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base

# `mp_`-prefixed and deliberately separate from the single-player `game_runs`
# family (app/models/gamification.py): multiplayer answers never feed SRS or
# XP, so this is durable *history*, not gameplay state — the live game lives
# in Redis (see services/multiplayer_store.py) and only lands here at the
# three points documented on each model below.


class MPSession(Base):
    """One row per game actually started (written once, at the
    countdown -> first-question transition — never at bare room creation,
    since most created rooms never start). `room_code` is intentionally not
    unique: the same 4-char code legitimately recurs across unrelated games
    once the room it named has expired."""

    __tablename__ = "mp_sessions"
    __table_args__ = (
        Index("ix_mp_sessions_room_code", "room_code"),
        Index("ix_mp_sessions_host_created", "host_user_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    room_code: Mapped[str] = mapped_column(String(4), nullable=False)
    host_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    mode: Mapped[str] = mapped_column(String(20), nullable=False)  # vocab|grammar|pairs|mixed
    cefr_level: Mapped[str] = mapped_column(String(2), nullable=False)
    timer_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    question_count: Mapped[int] = mapped_column(Integer, nullable=False)
    player_count: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(12), default="in_progress", nullable=False
    )  # in_progress|finished|abandoned
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class MPQuestion(Base):
    """One row per question as actually played — denormalized text, not an
    FK to Word/WordSense. Questions are sourced from live, mutable, sometimes
    later-unpublished corpus rows; "review your mistakes" must keep showing
    exactly what was on screen at play-time regardless of later edits.
    Written in the same batch as the owning MPSession."""

    __tablename__ = "mp_questions"
    __table_args__ = (
        UniqueConstraint("session_id", "question_index", name="uq_mp_question_session_index"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("mp_sessions.id", ondelete="CASCADE"), nullable=False
    )
    question_index: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    answer_index: Mapped[int] = mapped_column(Integer, nullable=False)
    # Nullable: grammar-mode questions ship without a teaching explanation in
    # this pass (app/services/grammar.py has no explanation-capable content
    # yet — a separate future content-authoring task).
    explanation: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)


class MPPlayer(Base):
    """One row per (session, user) — doubles as the final result row.
    Written once, at FINISHED. `SET NULL` + a name snapshot so a later
    account deletion never corrupts another player's history."""

    __tablename__ = "mp_players"
    __table_args__ = (Index("ix_mp_players_session", "session_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("mp_sessions.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    display_name_snapshot: Mapped[str] = mapped_column(String(80), nullable=False)
    final_score: Mapped[int] = mapped_column(Integer, nullable=False)
    final_rank: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    answered_count: Mapped[int] = mapped_column(Integer, nullable=False)
    best_streak: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_response_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fastest_response_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    left_early: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class MPAnswer(Base):
    """One row per (question, user) actually answered — bulk-inserted once
    per question, at the question -> question_result transition (accumulated
    in the live Redis room state in the meantime, since scoring already needs
    that data; this is not written on the per-answer hot path)."""

    __tablename__ = "mp_answers"
    __table_args__ = (
        UniqueConstraint("question_id", "user_id", name="uq_mp_answer_question_user"),
        Index("ix_mp_answers_session", "session_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("mp_sessions.id", ondelete="CASCADE"), nullable=False
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("mp_questions.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    option_index: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # None = timed out
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    points_awarded: Mapped[int] = mapped_column(Integer, nullable=False)
    streak_at_answer: Mapped[int] = mapped_column(Integer, nullable=False)
    response_ms: Mapped[int] = mapped_column(Integer, nullable=False)
