"""English Expression Library — premium IELTS/native-speaker phrases.

Distinct from the single-word `words` corpus: these are multi-word expressions
(opinion phrases, linking words, IELTS speaking expressions…) with a rich
teaching schema. The list-valued fields are stored as JSON so the whole entry
round-trips as one row.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Index, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class Expression(Base):
    __tablename__ = "expressions"
    __table_args__ = (
        Index("ix_expressions_category_cefr", "category", "cefr"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)
    expression: Mapped[str] = mapped_column(String(200), nullable=False)
    uzbek: Mapped[str] = mapped_column(Text, nullable=False)
    russian: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cefr: Mapped[str] = mapped_column(String(2), nullable=False)
    ielts_band: Mapped[str] = mapped_column(String(8), nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False)
    formality: Mapped[str] = mapped_column(String(10), nullable=False)  # Formal|Neutral|Informal
    usage: Mapped[str] = mapped_column(Text, nullable=False)
    grammar_pattern: Mapped[str] = mapped_column(Text, nullable=False)
    native_notes: Mapped[str] = mapped_column(Text, nullable=False)
    # List-valued teaching fields, stored as JSON arrays of strings.
    common_mistakes: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    alternatives: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    example_sentences: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    collocations: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    synonyms: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    opposites: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
