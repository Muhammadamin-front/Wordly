"""Pure, server-authoritative rules for Vocora's multiplayer word-chain game.

The room has no database, network, Redis, or asyncio dependencies. Transport
code validates a word through ``DictionaryService`` and then calls
``submit_validated_word`` against a freshly loaded room. That second call
rechecks the turn, deadline, starting letter, and duplicate set so a slow
dictionary lookup can never commit stale state.
"""

from __future__ import annotations

import random
import re
import string
import time
from dataclasses import asdict, dataclass, field
from typing import Callable, Dict, Iterable, Literal, Optional
from uuid import UUID, uuid4

WORD_PATTERN = re.compile(r"^[a-z]+$")
ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

RejectionReason = Literal[
    "EMPTY_WORD",
    "TOO_SHORT",
    "UNSUPPORTED_CHARACTERS",
    "INVALID_WORD",
    "DICTIONARY_UNAVAILABLE",
    "WRONG_LETTER",
    "DUPLICATE_WORD",
    "TIME_EXPIRED",
    "NOT_YOUR_TURN",
    "PLAYER_ELIMINATED",
    "GAME_NOT_PLAYING",
]

ChallengeKind = Literal["min_length", "minimum_vowels", "longer_than_last"]


@dataclass(frozen=True)
class WordChainConfig:
    starting_time: int = 15
    time_decrease_per_round: int = 1
    minimum_time: int = 5
    min_players: int = 2
    max_players: int = 8
    minimum_word_length: int = 3
    difficult_letter_threshold: int = 15
    lives_per_player: int = 2
    streak_bonus_threshold: int = 3
    streak_time_bonus: int = 2
    bot_min_delay: float = 1.0
    bot_max_delay: float = 5.0

    def time_limit_for_round(self, round_number: int) -> int:
        return max(
            self.minimum_time,
            self.starting_time - max(0, round_number - 1) * self.time_decrease_per_round,
        )


DEFAULT_WORD_CHAIN_CONFIG = WordChainConfig()


def normalize_word(raw: object) -> str:
    """Normalize case/outer whitespace without silently repairing guesses.

    Unsupported internal characters remain present so validation can give an
    explicit error instead of turning ``b-l-u-e`` into a different submission.
    """

    return str(raw or "").strip().lower()


def generate_word_chain_code(length: int = 6) -> str:
    return "".join(random.choice(ROOM_CODE_ALPHABET) for _ in range(length))


@dataclass
class WordChainPlayer:
    user_id: UUID
    name: str
    avatar_url: Optional[str] = None
    is_bot: bool = False
    # The most recent WebSocket that attached this player. A reconnect can
    # overlap a delayed close from the old socket, so presence changes must be
    # tied to this incarnation rather than just a user id.
    connection_id: Optional[str] = None
    connected: bool = True
    eliminated: bool = False
    lives_remaining: int = 2
    streak: int = 0
    words: list[str] = field(default_factory=list)
    eliminated_at_round: Optional[int] = None
    eliminated_reason: Optional[str] = None

    def to_state(self) -> dict:
        return {
            "user_id": str(self.user_id),
            "name": self.name,
            "avatar_url": self.avatar_url,
            "is_bot": self.is_bot,
            "connection_id": self.connection_id,
            "connected": self.connected,
            "eliminated": self.eliminated,
            "lives_remaining": self.lives_remaining,
            "streak": self.streak,
            "words": list(self.words),
            "eliminated_at_round": self.eliminated_at_round,
            "eliminated_reason": self.eliminated_reason,
        }

    @classmethod
    def from_state(cls, state: dict) -> "WordChainPlayer":
        return cls(
            user_id=UUID(state["user_id"]),
            name=state["name"],
            avatar_url=state.get("avatar_url"),
            is_bot=bool(state.get("is_bot", False)),
            connection_id=state.get("connection_id"),
            connected=bool(state.get("connected", True)),
            eliminated=bool(state.get("eliminated", False)),
            lives_remaining=max(0, int(state.get("lives_remaining", 2))),
            streak=max(0, int(state.get("streak", 0))),
            words=list(state.get("words", [])),
            eliminated_at_round=state.get("eliminated_at_round"),
            eliminated_reason=state.get("eliminated_reason"),
        )


@dataclass(frozen=True)
class SubmissionResult:
    accepted: bool
    reason: Optional[RejectionReason] = None
    word: Optional[str] = None
    next_letter: Optional[str] = None


class WordChainRoom:
    def __init__(
        self,
        code: str,
        host_id: UUID,
        *,
        config: WordChainConfig = DEFAULT_WORD_CHAIN_CONFIG,
        clock: Callable[[], float] = time.time,
        online_match: bool = False,
    ) -> None:
        self.code = code
        self.host_id = host_id
        self.config = config
        self._clock = clock
        self.status: Literal["waiting", "playing", "finished"] = "waiting"
        self.players: Dict[UUID, WordChainPlayer] = {}
        self.round_number = 0
        self.turn_number = 0
        self.current_player_id: Optional[UUID] = None
        self.required_letter = ""
        self.last_word: Optional[str] = None
        self.used_words: list[str] = []
        self.letter_available_words: dict[str, int] = {letter: 0 for letter in string.ascii_lowercase}
        self.turn_started_at: Optional[float] = None
        self.turn_ends_at: Optional[float] = None
        self.started_at: Optional[float] = None
        self.finished_at: Optional[float] = None
        self.winner_id: Optional[UUID] = None
        self.last_event: Optional[dict] = None
        self.challenge: Optional[dict] = None
        self.online_match = online_match

    def add_player(self, player: WordChainPlayer) -> bool:
        existing = self.players.get(player.user_id)
        if existing is not None:
            existing.connected = True
            existing.name = player.name
            existing.avatar_url = player.avatar_url
            existing.connection_id = player.connection_id
            return True
        if self.status != "waiting" or len(self.players) >= self.config.max_players:
            return False
        self.players[player.user_id] = player
        return True

    def add_bot(self, name: str = "Lexi Bot") -> Optional[WordChainPlayer]:
        if self.status != "waiting" or len(self.players) >= self.config.max_players:
            return None
        bot = WordChainPlayer(
            uuid4(), name, is_bot=True, lives_remaining=self.config.lives_per_player
        )
        self.players[bot.user_id] = bot
        return bot

    def mark_disconnected(self, user_id: UUID, connection_id: Optional[str] = None) -> bool:
        player = self.players.get(user_id)
        if (
            player is not None
            and not player.is_bot
            and (connection_id is None or player.connection_id == connection_id)
        ):
            player.connected = False
            return True
        return False

    def connection_matches(self, user_id: UUID, connection_id: str) -> bool:
        """Whether a mutation came from this player's newest live socket."""

        player = self.players.get(user_id)
        return bool(
            player is not None
            and player.connected
            and player.connection_id == connection_id
        )

    def remove_lobby_player(self, user_id: UUID) -> Optional[UUID]:
        if self.status != "waiting":
            return None
        self.players.pop(user_id, None)
        if self.host_id == user_id and self.players:
            self.host_id = next(iter(self.players))
            return self.host_id
        return None

    def permanently_disconnect(self, user_id: UUID) -> None:
        player = self.players.get(user_id)
        if player is None or player.connected or player.eliminated:
            return
        if self.status == "waiting":
            self.remove_lobby_player(user_id)
            return
        if self.status != "playing":
            return
        was_current = self.current_player_id == user_id
        previous_index = self._player_index(user_id)
        self._eliminate(player, "disconnected")
        self._finish_or_advance(previous_index if was_current else None)

    def start(self, letter_counts: dict[str, int], *, starting_letter: Optional[str] = None) -> None:
        if self.status != "waiting":
            raise ValueError("game already started")
        ready_players = [p for p in self.players.values() if p.connected and not p.eliminated]
        if len(ready_players) < self.config.min_players:
            raise ValueError("not enough players")

        self.letter_available_words = {
            letter: max(0, int(letter_counts.get(letter, 0))) for letter in string.ascii_lowercase
        }
        eligible = [
            letter
            for letter, count in self.letter_available_words.items()
            if count > self.config.difficult_letter_threshold
        ]
        if not eligible:
            eligible = [letter for letter, count in self.letter_available_words.items() if count > 0]
        if not eligible:
            raise ValueError("dictionary has no playable words")

        requested = normalize_word(starting_letter) if starting_letter else ""
        self.required_letter = requested if len(requested) == 1 and requested in eligible else random.choice(eligible)
        self.status = "playing"
        self.round_number = 1
        self.turn_number = 1
        self.current_player_id = ready_players[0].user_id
        for player in ready_players:
            player.lives_remaining = self.config.lives_per_player
            player.streak = 0
        self.started_at = self._clock()
        self._start_turn(self.started_at)
        self.last_event = {"kind": "game_started", "required_letter": self.required_letter}

    def time_limit(self) -> int:
        return self.config.time_limit_for_round(max(1, self.round_number))

    def current_turn_time_limit(self) -> int:
        """Return the actual server timer for the player currently in turn."""

        player = self.players.get(self.current_player_id) if self.current_player_id else None
        bonus = (
            self.config.streak_time_bonus
            if player is not None and player.streak >= self.config.streak_bonus_threshold
            else 0
        )
        return self.time_limit() + bonus

    def preliminary_check(self, user_id: UUID, raw_word: object) -> SubmissionResult:
        if self.status != "playing":
            return SubmissionResult(False, "GAME_NOT_PLAYING")
        player = self.players.get(user_id)
        if player is None or self.current_player_id != user_id:
            return SubmissionResult(False, "NOT_YOUR_TURN")
        if player.eliminated:
            return SubmissionResult(False, "PLAYER_ELIMINATED")
        if self.turn_ends_at is None or self._clock() >= self.turn_ends_at:
            return SubmissionResult(False, "TIME_EXPIRED")

        word = normalize_word(raw_word)
        if not word:
            return SubmissionResult(False, "EMPTY_WORD")
        if not WORD_PATTERN.fullmatch(word):
            return SubmissionResult(False, "UNSUPPORTED_CHARACTERS", word=word)
        if len(word) < self.config.minimum_word_length:
            return SubmissionResult(False, "TOO_SHORT", word=word)
        if not word.startswith(self.required_letter):
            return SubmissionResult(False, "WRONG_LETTER", word=word)
        if word in self.used_words:
            return SubmissionResult(False, "DUPLICATE_WORD", word=word)
        return SubmissionResult(True, word=word)

    def submit_validated_word(
        self,
        user_id: UUID,
        raw_word: object,
        *,
        dictionary_valid: bool,
        dictionary_available: bool = True,
    ) -> SubmissionResult:
        check = self.preliminary_check(user_id, raw_word)
        if not check.accepted:
            return check
        word = check.word or ""
        if not dictionary_available:
            return SubmissionResult(False, "DICTIONARY_UNAVAILABLE", word=word)
        if not dictionary_valid:
            return SubmissionResult(False, "INVALID_WORD", word=word)

        current_id = self.current_player_id
        assert current_id is not None
        player = self.players[current_id]
        previous_index = self._player_index(current_id)
        player.words.append(word)
        self.used_words.append(word)
        challenge_completed = self._challenge_is_complete(word)
        player.streak += 2 if challenge_completed else 1
        self.last_word = word
        previous_letter = word[-1]
        self.required_letter = self._next_letter(word)
        self.round_number += 1
        self.turn_number += 1
        if self._finish_if_possible():
            return SubmissionResult(True, word=word, next_letter=self.required_letter)

        self.current_player_id = self._next_connected_active(previous_index)
        if self.current_player_id is None:
            self._finish_if_possible()
        else:
            self._start_turn(self._clock())
        self.last_event = {
            "kind": "word_accepted",
            "player_id": str(current_id),
            "word": word,
            "next_letter": self.required_letter,
            "fallback_used": previous_letter != self.required_letter,
            "challenge_completed": challenge_completed,
            "streak": player.streak,
        }
        return SubmissionResult(True, word=word, next_letter=self.required_letter)

    def expire_current_turn(self) -> bool:
        if self.status != "playing" or self.current_player_id is None:
            return False
        if self.turn_ends_at is not None and self._clock() < self.turn_ends_at:
            return False
        player = self.players[self.current_player_id]
        previous_index = self._player_index(player.user_id)
        player.lives_remaining = max(0, player.lives_remaining - 1)
        player.streak = 0
        if player.lives_remaining == 0:
            self._eliminate(player, "timeout")
            self.last_event = {
                "kind": "player_eliminated",
                "player_id": str(player.user_id),
                "reason": "timeout",
            }
        else:
            self.last_event = {
                "kind": "life_lost",
                "player_id": str(player.user_id),
                "reason": "timeout",
                "lives_remaining": player.lives_remaining,
            }
        self._finish_or_advance(previous_index)
        return True

    def eliminate_bot_without_word(self, user_id: UUID) -> bool:
        if self.status != "playing" or self.current_player_id != user_id:
            return False
        player = self.players.get(user_id)
        if player is None or not player.is_bot or player.eliminated:
            return False
        previous_index = self._player_index(user_id)
        self._eliminate(player, "no_word")
        self.last_event = {
            "kind": "player_eliminated",
            "player_id": str(user_id),
            "reason": "no_word",
        }
        self._finish_or_advance(previous_index)
        return True

    def letter_stats(self, letter: str) -> dict:
        normalized = normalize_word(letter)[:1]
        available = self.letter_available_words.get(normalized, 0)
        used = sum(1 for word in self.used_words if word.startswith(normalized))
        remaining = max(0, available - used)
        return {
            "letter": normalized.upper(),
            "available_words": available,
            "used_words": used,
            "remaining_words": remaining,
            "is_restricted": remaining <= self.config.difficult_letter_threshold,
        }

    def public_state(self) -> dict:
        now = self._clock()
        players = []
        for player in self.players.values():
            status = "eliminated" if player.eliminated else "disconnected" if not player.connected else "active"
            players.append(
                {
                    "id": str(player.user_id),
                    "username": player.name,
                    "avatar_url": player.avatar_url,
                    "is_bot": player.is_bot,
                    "status": status,
                    "lives_remaining": player.lives_remaining,
                    "streak": player.streak,
                    "words_submitted": len(player.words),
                    "word_history": list(player.words),
                    "eliminated_at_round": player.eliminated_at_round,
                    "eliminated_reason": player.eliminated_reason,
                }
            )
        return {
            "code": self.code,
            "status": self.status,
            "host_id": str(self.host_id),
            "round": self.round_number,
            "turn": self.turn_number,
            "current_player_id": str(self.current_player_id) if self.current_player_id else None,
            "current_letter": self.required_letter.upper(),
            "last_word": self.last_word.upper() if self.last_word else None,
            "time_limit": (
                self.current_turn_time_limit()
                if self.status == "playing"
                else self.config.starting_time
            ),
            "turn_started_at": _ms(self.turn_started_at),
            "turn_ends_at": _ms(self.turn_ends_at),
            "server_now": _ms(now),
            "used_words": [word.upper() for word in self.used_words],
            "players": players,
            "active_players": sum(
                1 for p in self.players.values() if not p.eliminated and p.connected
            ),
            "eliminated_players": sum(1 for p in self.players.values() if p.eliminated),
            "winner_id": str(self.winner_id) if self.winner_id else None,
            "started_at": _ms(self.started_at),
            "finished_at": _ms(self.finished_at),
            "duration_seconds": (
                round((self.finished_at - self.started_at), 1)
                if self.finished_at is not None and self.started_at is not None
                else None
            ),
            "letter_stats": {
                letter.upper(): self.letter_stats(letter) for letter in string.ascii_lowercase
            },
            "challenge": self.challenge,
            "matchmaking_status": (
                "searching"
                if self.online_match
                and self.status == "waiting"
                and sum(1 for p in self.players.values() if p.connected and not p.eliminated)
                < self.config.min_players
                else "matched"
                if self.online_match
                else None
            ),
            "last_event": self.last_event,
            "config": {
                "starting_time": self.config.starting_time,
                "minimum_time": self.config.minimum_time,
                "minimum_word_length": self.config.minimum_word_length,
                "difficult_letter_threshold": self.config.difficult_letter_threshold,
                "min_players": self.config.min_players,
                "max_players": self.config.max_players,
                "lives_per_player": self.config.lives_per_player,
                "streak_bonus_threshold": self.config.streak_bonus_threshold,
                "streak_time_bonus": self.config.streak_time_bonus,
            },
        }

    def to_state(self) -> dict:
        return {
            "code": self.code,
            "host_id": str(self.host_id),
            "config": asdict(self.config),
            "status": self.status,
            "players": [player.to_state() for player in self.players.values()],
            "round_number": self.round_number,
            "turn_number": self.turn_number,
            "current_player_id": str(self.current_player_id) if self.current_player_id else None,
            "required_letter": self.required_letter,
            "last_word": self.last_word,
            "used_words": list(self.used_words),
            "letter_available_words": dict(self.letter_available_words),
            "turn_started_at": self.turn_started_at,
            "turn_ends_at": self.turn_ends_at,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "winner_id": str(self.winner_id) if self.winner_id else None,
            "challenge": self.challenge,
            "online_match": self.online_match,
            "last_event": self.last_event,
        }

    @classmethod
    def from_state(
        cls, state: dict, *, clock: Callable[[], float] = time.time
    ) -> "WordChainRoom":
        room = cls(
            state["code"],
            UUID(state["host_id"]),
            config=WordChainConfig(**state.get("config", {})),
            clock=clock,
            online_match=bool(state.get("online_match", False)),
        )
        room.status = state["status"]
        room.players = {
            player.user_id: player
            for player in (WordChainPlayer.from_state(item) for item in state.get("players", []))
        }
        room.round_number = int(state.get("round_number", 0))
        room.turn_number = int(state.get("turn_number", 0))
        room.current_player_id = UUID(state["current_player_id"]) if state.get("current_player_id") else None
        room.required_letter = state.get("required_letter", "")
        room.last_word = state.get("last_word")
        room.used_words = list(state.get("used_words", []))
        room.letter_available_words = dict(state.get("letter_available_words", {}))
        room.turn_started_at = state.get("turn_started_at")
        room.turn_ends_at = state.get("turn_ends_at")
        room.started_at = state.get("started_at")
        room.finished_at = state.get("finished_at")
        room.winner_id = UUID(state["winner_id"]) if state.get("winner_id") else None
        room.challenge = state.get("challenge")
        room.last_event = state.get("last_event")
        return room

    def _next_letter(self, word: str) -> str:
        candidates = list(dict.fromkeys(reversed(word)))
        for letter in candidates:
            if not self.letter_stats(letter)["is_restricted"]:
                return letter
        # Every letter in the word is scarce: choose the least exhausted one
        # deterministically instead of creating an impossible turn.
        return max(candidates, key=lambda letter: self.letter_stats(letter)["remaining_words"])

    def _start_turn(self, now: float) -> None:
        self.challenge = self._draw_challenge()
        self.turn_started_at = now
        self.turn_ends_at = now + self.current_turn_time_limit()

    def _draw_challenge(self) -> dict[str, ChallengeKind | int]:
        """Choose an optional bonus goal that never makes a valid word unusable.

        The goal only accelerates a player's streak. That preserves a playable
        core loop even when the current letter has a very small word supply.
        """

        choices: list[tuple[ChallengeKind, int]] = [
            ("min_length", max(5, self.config.minimum_word_length + 2)),
            ("minimum_vowels", 2),
        ]
        if self.last_word:
            choices.append(("longer_than_last", len(self.last_word) + 1))
        kind, target = random.choice(choices)
        return {"kind": kind, "target": target}

    def _challenge_is_complete(self, word: str) -> bool:
        challenge = self.challenge
        if not challenge:
            return False
        kind = challenge.get("kind")
        target = int(challenge.get("target", 0))
        if kind == "min_length":
            return len(word) >= target
        if kind == "minimum_vowels":
            return sum(letter in "aeiou" for letter in word) >= target
        if kind == "longer_than_last":
            return len(word) >= target
        return False

    def _player_index(self, user_id: UUID) -> int:
        return list(self.players).index(user_id)

    def _next_connected_active(self, previous_index: int) -> Optional[UUID]:
        ids = list(self.players)
        for offset in range(1, len(ids) + 1):
            candidate = self.players[ids[(previous_index + offset) % len(ids)]]
            if not candidate.eliminated and candidate.connected:
                return candidate.user_id
        return None

    def _eliminate(self, player: WordChainPlayer, reason: str) -> None:
        player.eliminated = True
        player.lives_remaining = 0
        player.streak = 0
        player.eliminated_at_round = self.round_number
        player.eliminated_reason = reason

    def _finish_or_advance(self, previous_index: Optional[int]) -> None:
        if self._finish_if_possible():
            return
        if previous_index is None:
            return
        self.round_number += 1
        self.turn_number += 1
        self.current_player_id = self._next_connected_active(previous_index)
        if self.current_player_id is not None:
            self._start_turn(self._clock())
        else:
            # Every remaining player is temporarily disconnected. There is no
            # turn to render or timer to schedule while their grace handlers
            # resolve the abandoned room.
            self.turn_started_at = None
            self.turn_ends_at = None

    def _finish_if_possible(self) -> bool:
        # Disconnected players cannot receive turns, so they must not keep a
        # connected player in an endless solo loop while their grace timer
        # runs. A reconnect reattaches the player before later state changes.
        remaining = [
            player
            for player in self.players.values()
            if not player.eliminated and player.connected
        ]
        if len(remaining) != 1:
            return False
        winner = remaining[0]
        self.status = "finished"
        self.winner_id = winner.user_id
        self.current_player_id = None
        self.turn_started_at = None
        self.turn_ends_at = None
        self.finished_at = self._clock()
        self.last_event = {
            "kind": "game_finished",
            "winner_id": str(winner.user_id),
        }
        return True


def bot_choice(words: Iterable[str], required_letter: str, used_words: Iterable[str]) -> Optional[str]:
    used = {normalize_word(word) for word in used_words}
    candidates = [
        normalized
        for raw in words
        if (normalized := normalize_word(raw))
        and WORD_PATTERN.fullmatch(normalized)
        and normalized.startswith(normalize_word(required_letter))
        and normalized not in used
    ]
    return random.choice(candidates) if candidates else None


def _ms(value: Optional[float]) -> Optional[int]:
    return round(value * 1000) if value is not None else None
