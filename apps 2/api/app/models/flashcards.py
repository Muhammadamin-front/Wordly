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
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utcnow
from app.db.base import Base
from app.models.vocabulary import Word
from app.services.srs import DEFAULT_EASE


class Deck(Base):
    __tablename__ = "decks"
    __table_args__ = (Index("ix_decks_user_id", "user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    cards: Mapped[List["Card"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan", lazy="noload"
    )


class Card(Base):
    """A learnable item with embedded SRS state.

    Either linked to a corpus word (word_id) or a custom front/back pair —
    never both empty. deck_id NULL means the user's main (corpus) deck.
    """

    __tablename__ = "cards"
    __table_args__ = (
        # A corpus word appears at most once per user (across all decks).
        UniqueConstraint("user_id", "word_id", name="uq_cards_user_word"),
        Index("ix_cards_user_due", "user_id", "due_at"),
        Index("ix_cards_user_deck", "user_id", "deck_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    deck_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("decks.id", ondelete="CASCADE"), nullable=True
    )
    word_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("words.id", ondelete="CASCADE"), nullable=True
    )
    front_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    back_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    memory_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # SRS state (mirrors services.srs.SrsState)
    srs_state: Mapped[str] = mapped_column(String(12), default="new", nullable=False)
    srs_step: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ease_factor: Mapped[float] = mapped_column(Float, default=DEFAULT_EASE, nullable=False)
    interval_days: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    repetitions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lapses: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    due_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )

    deck: Mapped[Optional[Deck]] = relationship(back_populates="cards")
    word: Mapped[Optional[Word]] = relationship(lazy="joined")


class ReviewLog(Base):
    """Append-only. Never updated, never deleted — this history is the user's
    learning record and the input for retention analytics (M5) and FSRS (later)."""

    __tablename__ = "review_logs"
    __table_args__ = (
        Index("ix_review_logs_user_time", "user_id", "reviewed_at"),
        Index("ix_review_logs_card", "card_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    card_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)  # no FK: log outlives card
    rating: Mapped[str] = mapped_column(String(8), nullable=False)
    state_before: Mapped[str] = mapped_column(String(12), nullable=False)
    interval_before: Mapped[float] = mapped_column(Float, nullable=False)
    interval_after: Mapped[float] = mapped_column(Float, nullable=False)
    ease_before: Mapped[float] = mapped_column(Float, nullable=False)
    ease_after: Mapped[float] = mapped_column(Float, nullable=False)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class ReviewReceipt(Base):
    """A durable response receipt for exactly-once review submissions."""

    __tablename__ = "review_receipts"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "idempotency_key", name="uq_review_receipts_user_key"
        ),
        Index("ix_review_receipts_user_created", "user_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    card_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(64), nullable=False)
    result_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
