"""Replaceable dictionary provider for the multiplayer word-chain game."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Literal, Optional, Protocol

from sqlalchemy import select

from app.core.cache import Cache
from app.models.vocabulary import Word
from app.services.external_dictionary import lookup_external_word
from app.services.word_chain import WORD_PATTERN, normalize_word


@dataclass(frozen=True)
class DictionaryValidation:
    status: Literal["valid", "invalid", "unavailable"]
    normalized_word: str

    @property
    def valid(self) -> bool:
        return self.status == "valid"


class DictionaryService(Protocol):
    async def validate_word(self, word: str) -> DictionaryValidation: ...
    async def letter_counts(self) -> dict[str, int]: ...
    async def candidate_words(self, letter: str, used_words: list[str]) -> list[str]: ...


class CorpusDictionaryService:
    """Vocora's curated corpus first, external lexical source as fallback.

    Enumeration for bots and per-letter fairness comes only from the curated
    corpus because a definition endpoint cannot enumerate a whole alphabet.
    Existence checks can still accept a real English word outside the corpus.
    """

    CORPUS_CACHE_KEY = "word-chain:published-corpus:v1"
    VALID_CACHE_PREFIX = "word-chain:validation:v1:"
    CORPUS_TTL_SECONDS = 15 * 60
    VALID_TTL_SECONDS = 24 * 60 * 60
    INVALID_TTL_SECONDS = 60 * 60

    def __init__(self, db_factory, cache: Optional[Cache] = None) -> None:
        self._db_factory = db_factory
        self._cache = cache

    async def validate_word(self, word: str) -> DictionaryValidation:
        normalized = normalize_word(word)
        cache_key = self.VALID_CACHE_PREFIX + normalized
        try:
            cached = await self._cache.get(cache_key) if self._cache is not None else None
        except Exception:
            # A cache miss is always safe; a cache outage must not eject a
            # player from their WebSocket or make the game trust the client.
            cached = None
        if cached in {"valid", "invalid"}:
            return DictionaryValidation(cached, normalized)  # type: ignore[arg-type]

        try:
            corpus = await self._corpus_words()
        except Exception:
            # Continue to the independent lexical source below. If that is
            # unavailable too, return a retryable status rather than guessing.
            corpus = set()
        if normalized in corpus:
            await self._cache_result(cache_key, "valid", self.VALID_TTL_SECONDS)
            return DictionaryValidation("valid", normalized)

        # Retry one transient provider failure. A genuine not-found response is
        # authoritative and is cached; an outage is not cached, so the player
        # can retry during the same turn.
        try:
            lookup = await lookup_external_word(normalized)
            if lookup.status == "unavailable":
                lookup = await lookup_external_word(normalized)
        except Exception:
            return DictionaryValidation("unavailable", normalized)
        if lookup.status == "unavailable":
            return DictionaryValidation("unavailable", normalized)
        status: Literal["valid", "invalid"] = "valid" if lookup.status == "found" else "invalid"
        await self._cache_result(
            cache_key,
            status,
            self.VALID_TTL_SECONDS if status == "valid" else self.INVALID_TTL_SECONDS,
        )
        return DictionaryValidation(status, normalized)

    async def letter_counts(self) -> dict[str, int]:
        counts = {letter: 0 for letter in "abcdefghijklmnopqrstuvwxyz"}
        try:
            corpus = await self._corpus_words()
        except Exception:
            return counts
        for word in corpus:
            counts[word[0]] += 1
        return counts

    async def candidate_words(self, letter: str, used_words: list[str]) -> list[str]:
        normalized_letter = normalize_word(letter)[:1]
        used = {normalize_word(word) for word in used_words}
        return [
            word for word in await self._corpus_words()
            if word.startswith(normalized_letter) and word not in used
        ]

    async def _corpus_words(self) -> set[str]:
        cached = await self._cache.get(self.CORPUS_CACHE_KEY) if self._cache is not None else None
        if cached is not None:
            try:
                decoded = json.loads(cached)
                if not isinstance(decoded, list) or not all(isinstance(word, str) for word in decoded):
                    raise ValueError("invalid cached corpus")
                return {
                    word
                    for word in decoded
                    if WORD_PATTERN.fullmatch(word) and len(word) >= 3
                }
            except (TypeError, ValueError):
                # A bad cached value is never authoritative. Rebuild it from
                # the published corpus instead of failing every active game.
                pass
        async with self._db_factory() as db:
            headwords = (await db.scalars(select(Word.headword).where(Word.status == "published"))).all()
        corpus = {
            normalized
            for raw in headwords
            if (normalized := normalize_word(raw))
            and WORD_PATTERN.fullmatch(normalized)
            and len(normalized) >= 3
        }
        if self._cache is not None:
            try:
                await self._cache.set(
                    self.CORPUS_CACHE_KEY,
                    json.dumps(sorted(corpus), separators=(",", ":")),
                    self.CORPUS_TTL_SECONDS,
                )
            except Exception:
                # The freshly queried corpus is usable even if Redis is not.
                pass
        return corpus

    async def _cache_result(self, key: str, value: str, ttl_seconds: int) -> None:
        if self._cache is not None:
            try:
                await self._cache.set(key, value, ttl_seconds)
            except Exception:
                # Validation is still correct without a cache; a write failure
                # must remain invisible to the player.
                pass
