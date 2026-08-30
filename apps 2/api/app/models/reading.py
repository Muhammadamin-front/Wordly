"""Graded reading passages with comprehension questions (M11 skills)."""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utcnow
from app.db.base import Base


class ReadingPassage(Base):
    __tablename__ = "reading_passages"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    cefr_level: Mapped[str] = mapped_column(String(2), nullable=False, index=True)
    title_en: Mapped[str] = mapped_column(String(160), nullable=False)
    body_en: Mapped[str] = mapped_column(Text, nullable=False)
    # Optional gloss so beginners can check comprehension after answering.
    summary_uz: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(10), default="published", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    questions: Mapped[List["ReadingQuestion"]] = relationship(
        back_populates="passage",
        cascade="all, delete-orphan",
        order_by="ReadingQuestion.question_order",
        lazy="selectin",
    )


class ReadingQuestion(Base):
    __tablename__ = "reading_questions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    passage_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("reading_passages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    prompt_en: Mapped[str] = mapped_column(Text, nullable=False)
    # JSON-encoded list of option strings; answer_index points into it.
    options_json: Mapped[str] = mapped_column(Text, nullable=False)
    answer_index: Mapped[int] = mapped_column(Integer, nullable=False)

    passage: Mapped[ReadingPassage] = relationship(back_populates="questions")
