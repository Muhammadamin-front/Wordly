import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utcnow
from app.db.base import Base

CEFR_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
WORD_STATUSES = ("draft", "review", "published")
RELATION_TYPES = ("synonym", "antonym", "collocation", "phrasal_verb", "related")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(80), nullable=False)
    name_uz: Mapped[str] = mapped_column(String(80), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(80), nullable=False)
    emoji: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Word(Base):
    __tablename__ = "words"
    __table_args__ = (
        Index("ix_words_level_status", "cefr_level", "status"),
        Index("ix_words_headword", "headword"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    headword: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)  # SEO: /words/<slug>
    pos: Mapped[str] = mapped_column(String(20), nullable=False)  # noun|verb|adjective|...
    ipa: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    cefr_level: Mapped[str] = mapped_column(String(2), nullable=False)
    frequency_rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    word_family: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)  # groups act/action/active
    common_mistake: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Uzbek-learner pitfall note
    status: Mapped[str] = mapped_column(String(10), default="draft", nullable=False)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )

    # One-directional on purpose: a Category->words backref would fire lazy
    # loads/append events during async construction for no product benefit.
    category: Mapped[Optional[Category]] = relationship(lazy="joined")
    senses: Mapped[List["WordSense"]] = relationship(
        back_populates="word",
        cascade="all, delete-orphan",
        order_by="WordSense.sense_order",
        lazy="selectin",
    )
    relations: Mapped[List["WordRelation"]] = relationship(
        back_populates="word",
        cascade="all, delete-orphan",
        foreign_keys="WordRelation.word_id",
        lazy="selectin",
    )


class WordSense(Base):
    __tablename__ = "word_senses"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    word_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("words.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sense_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    definition_en: Mapped[str] = mapped_column(Text, nullable=False)  # learner-graded English
    translation_uz: Mapped[str] = mapped_column(String(160), nullable=False)
    translation_ru: Mapped[str] = mapped_column(String(160), nullable=False)
    definition_uz: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    definition_ru: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    usage_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    word: Mapped[Word] = relationship(back_populates="senses")
    examples: Mapped[List["WordExample"]] = relationship(
        back_populates="sense",
        cascade="all, delete-orphan",
        order_by="WordExample.example_order",
        lazy="selectin",
    )


class WordExample(Base):
    __tablename__ = "word_examples"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    sense_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("word_senses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    example_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    text_en: Mapped[str] = mapped_column(Text, nullable=False)
    text_uz: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    text_ru: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    sense: Mapped[WordSense] = relationship(back_populates="examples")


class WordRelation(Base):
    """Synonyms/antonyms/collocations. Points at another corpus word when we
    have it, otherwise stores plain text so content is never blocked on corpus
    coverage."""

    __tablename__ = "word_relations"
    __table_args__ = (
        UniqueConstraint("word_id", "relation_type", "related_text", name="uq_word_relation"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    word_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("words.id", ondelete="CASCADE"), nullable=False, index=True
    )
    relation_type: Mapped[str] = mapped_column(String(20), nullable=False)
    related_text: Mapped[str] = mapped_column(String(120), nullable=False)
    related_word_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("words.id", ondelete="SET NULL"), nullable=True
    )

    word: Mapped[Word] = relationship(back_populates="relations", foreign_keys=[word_id])
