"""IELTS practice — AI-generated tests and band results.

Reading/Listening tests are generated on demand and stored server-side WITH
their answer keys, so the client only ever receives questions (never the
answers) and grading happens on the server (see services/ielts). IeltsResult is
the learner's band history across all four skills.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class IeltsTest(Base):
    """A generated Reading/Listening test, answer key included. Short-lived: the
    client references it by id when submitting answers."""

    __tablename__ = "ielts_tests"
    __table_args__ = (Index("ix_ielts_tests_user_created", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    kind: Mapped[str] = mapped_column(String(12), nullable=False)  # reading|listening
    # Full payload incl. answer keys (title, passage/script, questions[]).
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class IeltsResult(Base):
    """One scored attempt, for band history on the IELTS hub."""

    __tablename__ = "ielts_results"
    __table_args__ = (Index("ix_ielts_results_user_created", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    skill: Mapped[str] = mapped_column(String(12), nullable=False)  # reading|writing|listening|speaking
    band: Mapped[float] = mapped_column(Float, nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON feedback
    # Set when this result is one leg of an IELTS Full Mock (models/ielts_mock.py)
    # rather than standalone practice — lets the mock group its 4 results and
    # lets the hub filter "mock attempts only" without touching best_bands()/
    # recent_results(), which already read every IeltsResult regardless.
    mock_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("ielts_mock_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
