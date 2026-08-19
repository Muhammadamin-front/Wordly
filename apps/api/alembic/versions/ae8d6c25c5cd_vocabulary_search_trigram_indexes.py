"""vocabulary search: trigram indexes for the %term% search

The public and admin word search (services/vocabulary.list_words,
api/v1/flashcards search-to-add) filters with
lower(column) LIKE '%term%' across words.headword and
word_senses.translation_uz/translation_ru. A plain btree index (like
ix_words_headword) cannot serve a leading-wildcard LIKE, so this was a
sequential scan that gets slower as the corpus grows. GIN trigram
indexes make that same query plannable as an index scan without
changing any application code.

Revision ID: ae8d6c25c5cd
Revises: c8d3e1f5a7b2
Create Date: 2026-08-19

"""
from typing import Sequence, Union

from alembic import op


revision: str = "ae8d6c25c5cd"
down_revision: Union[str, None] = "c8d3e1f5a7b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        "CREATE INDEX ix_words_headword_trgm ON words "
        "USING gin (lower(headword) gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX ix_word_senses_translation_uz_trgm ON word_senses "
        "USING gin (lower(translation_uz) gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX ix_word_senses_translation_ru_trgm ON word_senses "
        "USING gin (lower(translation_ru) gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_word_senses_translation_ru_trgm")
    op.execute("DROP INDEX IF EXISTS ix_word_senses_translation_uz_trgm")
    op.execute("DROP INDEX IF EXISTS ix_words_headword_trgm")
