"""Durable background work.

AI scoring used to run inside the request that asked for it: a slow model
turned into a slow response, a dropped connection threw the result away, and
a transient provider error surfaced as a 502 the learner had to recover from
by resubmitting their essay. A queued job survives all three — the request
returns immediately, the worker retries, and the result waits to be read.
"""

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.security import utcnow
from app.db.base import Base

# JSONB on Postgres, plain JSON on the SQLite used by the fast test suite.
JsonType = JSON().with_variant(JSONB(), "postgresql")

JOB_QUEUED = "queued"
JOB_RUNNING = "running"
JOB_DONE = "done"
JOB_FAILED = "failed"


class AiJob(Base):
    __tablename__ = "ai_jobs"
    __table_args__ = (
        # The worker's claim query: oldest queued job first.
        Index("ix_ai_jobs_status_created", "status", "created_at"),
        # "How many jobs does this learner already have in flight?"
        Index("ix_ai_jobs_user_status", "user_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    kind: Mapped[str] = mapped_column(String(40), nullable=False)
    status: Mapped[str] = mapped_column(String(12), default=JOB_QUEUED, nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JsonType, nullable=False)
    result: Mapped[Optional[dict[str, Any]]] = mapped_column(JsonType, nullable=True)
    # Safe to show a learner: "the AI service is unavailable", never a
    # provider stack trace.
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
