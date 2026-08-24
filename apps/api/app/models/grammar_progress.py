"""Account-scoped grammar mastery shared by web and native clients."""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class GrammarProgress(Base):
    __tablename__ = "grammar_progress"
    __table_args__ = (
        CheckConstraint("attempts >= 1", name="ck_grammar_progress_attempts_positive"),
        CheckConstraint("best_score BETWEEN 0 AND 100", name="ck_grammar_progress_best_score"),
        CheckConstraint("last_score BETWEEN 0 AND 100", name="ck_grammar_progress_last_score"),
        Index("ix_grammar_progress_user_updated", "user_id", "updated_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    lesson_slug: Mapped[str] = mapped_column(String(160), primary_key=True)
    attempts: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    best_score: Mapped[int] = mapped_column(Integer, nullable=False)
    last_score: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class GrammarAttemptReceipt(Base):
    """Idempotency receipt: a retried device request must not add two attempts."""

    __tablename__ = "grammar_attempt_receipts"
    __table_args__ = (Index("ix_grammar_attempt_receipts_user_created", "user_id", "created_at"),)

    attempt_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    lesson_slug: Mapped[str] = mapped_column(String(160), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
