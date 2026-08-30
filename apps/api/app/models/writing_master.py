"""Account-scoped Master Writing curriculum progress. Mirrors grammar_progress.py
exactly — same idempotent-attempt-receipt pattern, same merge semantics — one row
per (user, unit) rather than per lesson."""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class WritingMasterProgress(Base):
    __tablename__ = "writing_master_progress"
    __table_args__ = (
        CheckConstraint("attempts >= 1", name="ck_writing_master_progress_attempts_positive"),
        CheckConstraint("best_score BETWEEN 0 AND 100", name="ck_writing_master_progress_best_score"),
        CheckConstraint("last_score BETWEEN 0 AND 100", name="ck_writing_master_progress_last_score"),
        Index("ix_writing_master_progress_user_updated", "user_id", "updated_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    unit_slug: Mapped[str] = mapped_column(String(40), primary_key=True)
    # 0-100, one scale for every step: vocab-viewed / paraphrase-passed /
    # overview-passed / full-practice-band all fold into this single score so
    # the client can render one progress bar per unit without a step enum
    # leaking into the sync protocol. See services.writing_master for the
    # exact per-step weights.
    attempts: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    best_score: Mapped[int] = mapped_column(Integer, nullable=False)
    last_score: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class WritingMasterAttemptReceipt(Base):
    """Idempotency receipt: a retried device request must not add two attempts."""

    __tablename__ = "writing_master_attempt_receipts"
    __table_args__ = (
        Index("ix_writing_master_attempt_receipts_user_created", "user_id", "created_at"),
    )

    attempt_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    unit_slug: Mapped[str] = mapped_column(String(40), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
