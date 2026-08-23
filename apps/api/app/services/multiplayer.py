"""Real-time multiplayer quiz — server-authoritative state machine.

`Room` holds every rule of the game and has no I/O: it is constructed, mutated
through its methods, and read back — fully unit-testable without a WebSocket
or Redis. The WS endpoint (api/v1/multiplayer.py) is a thin transport adapter
that loads a Room from a RoomStore (multiplayer_store.py), calls a method,
saves it back, and broadcasts the resulting message through
multiplayer_pubsub.py so it reaches every player regardless of which API
worker their socket is attached to.

Room's clock returns float seconds since the epoch (default `time.time`, so
values are directly meaningful as wire deadlines — `int(value * 1000)` for a
millisecond timestamp, no separate monotonic-to-wall-clock translation layer
needed) and is injectable so scoring/timing is exactly reproducible in tests.
"""
import secrets
import time
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional
from uuid import UUID

# --- scoring ---
# Correct answers score on a smooth speed curve from SPEED_MAX (answered the
# instant the question appeared) down to SPEED_MIN (answered right at the
# deadline) — plus a small streak bonus layered on top, capped low enough
# that speed and accuracy stay the dominant factors.
SPEED_MIN = 250
SPEED_MAX = 1000


def streak_bonus(streak: int) -> int:
    if streak >= 5:
        return 100
    if streak >= 3:
        return 50
    if streak >= 2:
        return 25
    return 0


_ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O/1/I — unambiguous when read aloud
DEFAULT_TIMER_SECONDS = 15
VALID_TIMER_SECONDS = (10, 15, 20, 30)
DEFAULT_QUESTION_COUNT = 8
MAX_PLAYERS = 12
COUNTDOWN_SECONDS = 3
RESULT_SECONDS = 4  # question_result phase dwell time
LEADERBOARD_SECONDS = 4  # leaderboard phase dwell time

PHASES = ("lobby", "countdown", "question", "question_result", "leaderboard", "finished")


@dataclass
class RoundAnswer:
    """One player's answer to one question — the append-only log a game
    accumulates. Feeds the question_result/leaderboard payloads, the final
    per-player summaries, the mistake review, and the mp_answers DB rows."""

    user_id: UUID
    question_index: int
    option_index: Optional[int]  # None if the round closed before they answered
    correct: bool
    points: int
    streak_after: int
    response_ms: int

    def to_dict(self) -> dict:
        return {
            "user_id": str(self.user_id),
            "question_index": self.question_index,
            "option_index": self.option_index,
            "correct": self.correct,
            "points": self.points,
            "streak_after": self.streak_after,
            "response_ms": self.response_ms,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RoundAnswer":
        return cls(
            user_id=UUID(data["user_id"]),
            question_index=data["question_index"],
            option_index=data["option_index"],
            correct=data["correct"],
            points=data["points"],
            streak_after=data["streak_after"],
            response_ms=data["response_ms"],
        )


class Player:
    def __init__(self, user_id: UUID, name: str):
        self.user_id = user_id
        self.name = name
        self.score = 0
        self.streak = 0
        self.best_streak = 0
        self.answered_round = -1  # index of the round this player last answered
        self.connected = True

    def to_dict(self) -> dict:
        return {
            "user_id": str(self.user_id),
            "name": self.name,
            "score": self.score,
            "streak": self.streak,
            "best_streak": self.best_streak,
            "answered_round": self.answered_round,
            "connected": self.connected,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Player":
        player = cls(UUID(data["user_id"]), data["name"])
        player.score = data["score"]
        player.streak = data["streak"]
        player.best_streak = data["best_streak"]
        player.answered_round = data["answered_round"]
        player.connected = data["connected"]
        return player


class Room:
    def __init__(self, code: str, host_id: UUID, clock: Callable[[], float] = time.time):
        self.code = code
        self.host_id = host_id
        self.players: Dict[UUID, Player] = {}
        self.questions: List[dict] = []
        self.phase = "lobby"
        self.current = 0
        self.mode = "vocab"  # vocab | grammar | pairs | mixed
        self.timer_seconds = DEFAULT_TIMER_SECONDS
        self._clock = clock  # injectable for deterministic tests

        self.round_started_at = 0.0
        self.round_ends_at = 0.0
        self.countdown_ends_at = 0.0
        self.result_ends_at = 0.0
        self.leaderboard_ends_at = 0.0
        self.finished_at: Optional[float] = None

        self.answers: List[RoundAnswer] = []  # append-only across the whole game
        self._last_ranks: Dict[UUID, int] = {}
        self._leaderboard_rows: List[dict] = []

        # Set once the DB session row exists (at countdown -> first question),
        # so later writes (per-question answers, final results) know where to
        # attach. None until then; the WS layer owns creating that row.
        self.session_db_id: Optional[str] = None

    # --- membership ---
    def add_player(self, player: Player) -> bool:
        """Adds a new player, or reattaches an already-known one (this is how
        reconnection works — `join` is idempotent per user_id and preserves
        score/streak; the WS layer separately (re)subscribes the connection
        to the room's pub/sub channel, which is the only "wiring" a
        reconnect needs — Room itself has no socket to reattach). Returns
        False only when a genuinely new player can't fit (room full)."""
        existing = self.players.get(player.user_id)
        if existing is not None:
            existing.connected = True
            existing.name = player.name
            return True
        if len(self.players) >= MAX_PLAYERS:
            return False
        self.players[player.user_id] = player
        return True

    def mark_disconnected(self, user_id: UUID) -> None:
        player = self.players.get(user_id)
        if player is not None:
            player.connected = False
            player.send = None

    def remove_player(self, user_id: UUID) -> Optional[UUID]:
        """Actually removes a player (grace period expired, or explicit
        leave). Returns the new host_id if this removal transferred host."""
        self.players.pop(user_id, None)
        return self._ensure_host()

    def _ensure_host(self) -> Optional[UUID]:
        if not self.players or self.host_id in self.players:
            return None
        new_host = next(iter(self.players))  # dict preserves join order
        self.host_id = new_host
        return new_host

    # --- lifecycle: lobby -> countdown ---
    def start(self, questions: List[dict], mode: str, timer_seconds: int = DEFAULT_TIMER_SECONDS) -> None:
        self.questions = questions
        self.mode = mode
        self.timer_seconds = timer_seconds if timer_seconds in VALID_TIMER_SECONDS else DEFAULT_TIMER_SECONDS
        self.answers = []
        self._last_ranks = {}
        self._leaderboard_rows = []
        for player in self.players.values():
            player.score = 0
            player.streak = 0
            player.best_streak = 0
            player.answered_round = -1
        self.phase = "countdown"
        self.countdown_ends_at = self._clock() + COUNTDOWN_SECONDS

    # --- countdown -> question, leaderboard -> question/finished ---
    def _begin_question(self, index: int) -> None:
        self.current = index
        self.phase = "question"
        self.round_started_at = self._clock()
        self.round_ends_at = self.round_started_at + self.timer_seconds

    def current_question(self) -> Optional[dict]:
        if self.phase != "question" or self.current >= len(self.questions):
            return None
        q = self.questions[self.current]
        # Never leak the answer index to clients.
        return {
            "index": self.current,
            "total": len(self.questions),
            "prompt": q["prompt"],
            "options": q["options"],
            "mode": self.mode,
            "category": q.get("category", self.mode),
            "started_at": self.round_started_at,
            "ends_at": self.round_ends_at,
        }

    # --- answering ---
    def _speed_points(self, now: float) -> int:
        remaining_ratio = max(0.0, min(1.0, (self.round_ends_at - now) / self.timer_seconds))
        return round(SPEED_MIN + (SPEED_MAX - SPEED_MIN) * remaining_ratio)

    def submit_answer(
        self, user_id: UUID, round_index: int, option_index: int, now: Optional[float] = None
    ) -> bool:
        """Record an answer for the current round. Returns True when every
        connected player in the room has now answered this round."""
        now = self._clock() if now is None else now
        player = self.players.get(user_id)
        if (
            player is None
            or self.phase != "question"
            or round_index != self.current
            or player.answered_round == self.current
            or now > self.round_ends_at
        ):
            return self.all_answered()

        player.answered_round = self.current
        question = self.questions[self.current]
        valid_option = 0 <= option_index < len(question["options"])
        correct = valid_option and option_index == question["answer_index"]
        response_ms = max(0, round((now - self.round_started_at) * 1000))

        if correct:
            player.streak += 1
            player.best_streak = max(player.best_streak, player.streak)
            points = self._speed_points(now) + streak_bonus(player.streak)
            player.score += points
        else:
            player.streak = 0
            points = 0

        self.answers.append(
            RoundAnswer(
                user_id=user_id,
                question_index=self.current,
                option_index=option_index if valid_option else None,
                correct=correct,
                points=points,
                streak_after=player.streak,
                response_ms=response_ms,
            )
        )
        return self.all_answered()

    def all_answered(self) -> bool:
        connected = [p for p in self.players.values() if p.connected]
        return bool(connected) and all(p.answered_round == self.current for p in connected)

    # --- question -> question_result ---
    def close_round(self) -> None:
        if self.phase != "question":
            return
        for player in self.players.values():
            if player.answered_round != self.current:
                # Never answered this round (timeout, or disconnected before
                # answering) — counts as wrong and resets their streak.
                player.streak = 0
                self.answers.append(
                    RoundAnswer(
                        user_id=player.user_id,
                        question_index=self.current,
                        option_index=None,
                        correct=False,
                        points=0,
                        streak_after=0,
                        response_ms=self.timer_seconds * 1000,
                    )
                )
        self.phase = "question_result"
        self.result_ends_at = self._clock() + RESULT_SECONDS

    def question_result_payload(self) -> dict:
        q = self.questions[self.current]
        results = [
            {
                "user_id": str(a.user_id),
                "option_index": a.option_index,
                "correct": a.correct,
                "points": a.points,
                "streak": a.streak_after,
            }
            for a in self.answers
            if a.question_index == self.current
        ]
        return {
            "index": self.current,
            "answer_index": q["answer_index"],
            "explanation": q.get("explanation"),
            "results": results,
            "ends_at": self.result_ends_at,
        }

    # --- question_result -> leaderboard ---
    def scoreboard(self) -> List[dict]:
        board = sorted(
            (
                {"user_id": str(p.user_id), "name": p.name, "score": p.score}
                for p in self.players.values()
            ),
            key=lambda row: row["score"],
            reverse=True,
        )
        for rank, row in enumerate(board, start=1):
            row["rank"] = rank
        return board

    def open_leaderboard(self) -> None:
        if self.phase != "question_result":
            return
        board = self.scoreboard()
        for row in board:
            user_id = UUID(row["user_id"])
            previous = self._last_ranks.get(user_id)
            row["previous_rank"] = previous
            row["delta"] = (previous - row["rank"]) if previous is not None else 0
            self._last_ranks[user_id] = row["rank"]
        self._leaderboard_rows = board
        self.phase = "leaderboard"
        self.leaderboard_ends_at = self._clock() + LEADERBOARD_SECONDS

    def leaderboard_payload(self) -> dict:
        return {
            "index": self.current,
            "total": len(self.questions),
            "board": self._leaderboard_rows,
            "ends_at": self.leaderboard_ends_at,
        }

    # --- leaderboard -> next question | finished ---
    def _advance_question(self) -> bool:
        """Moves to the next question. Returns False when the game is over."""
        self.current += 1
        if self.current >= len(self.questions):
            self.phase = "finished"
            self.finished_at = self._clock()
            return False
        self._begin_question(self.current)
        return True

    # --- the single dispatcher every phase-timer-fire or host `skip` calls ---
    def force_advance(self) -> None:
        """Forces whatever transition the phase timer would have fired
        anyway — used by both the server's own lock-and-fire timer and a
        host's manual `skip`, so there is exactly one code path for every
        phase change."""
        if self.phase == "countdown":
            self._begin_question(0)
        elif self.phase == "question":
            self.close_round()
        elif self.phase == "question_result":
            self.open_leaderboard()
        elif self.phase == "leaderboard":
            self._advance_question()

    def next_deadline(self) -> Optional[float]:
        """The epoch-seconds moment the current phase should auto-advance,
        or None while in lobby/finished (no timer)."""
        return {
            "countdown": self.countdown_ends_at,
            "question": self.round_ends_at,
            "question_result": self.result_ends_at,
            "leaderboard": self.leaderboard_ends_at,
        }.get(self.phase)

    # --- finished ---
    def summaries(self) -> Dict[str, dict]:
        board_ranks = {row["user_id"]: row["rank"] for row in self.scoreboard()}
        out: Dict[str, dict] = {}
        for player in self.players.values():
            mine = [a for a in self.answers if a.user_id == player.user_id]
            correct = [a for a in mine if a.correct]
            response_times = [a.response_ms for a in mine if a.option_index is not None]
            by_category: Dict[str, List[bool]] = {}
            for a in mine:
                category = self.questions[a.question_index].get("category", self.mode)
                by_category.setdefault(category, []).append(a.correct)
            out[str(player.user_id)] = {
                "score": player.score,
                "rank": board_ranks.get(str(player.user_id)),
                "accuracy": round(100 * len(correct) / len(mine)) if mine else 0,
                "correct_count": len(correct),
                "total": len(self.questions),
                "avg_response_ms": (
                    round(sum(response_times) / len(response_times)) if response_times else None
                ),
                "fastest_response_ms": min(response_times) if response_times else None,
                "best_streak": player.best_streak,
                "category_accuracy": {
                    category: round(100 * sum(flags) / len(flags))
                    for category, flags in by_category.items()
                },
            }
        return out

    def mistakes_review(self, user_id: UUID) -> List[dict]:
        """Every question this player missed (wrong or unanswered) — for
        their personal "review mistakes" screen."""
        mine_by_question = {a.question_index: a for a in self.answers if a.user_id == user_id}
        review = []
        for index, q in enumerate(self.questions):
            answer = mine_by_question.get(index)
            if answer is not None and answer.correct:
                continue
            review.append(
                {
                    "index": index,
                    "prompt": q["prompt"],
                    "options": q["options"],
                    "answer_index": q["answer_index"],
                    "your_answer_index": answer.option_index if answer else None,
                    "explanation": q.get("explanation"),
                    "category": q.get("category", self.mode),
                }
            )
        return review

    # --- views ---
    def lobby_state(self) -> dict:
        return {
            "code": self.code,
            "host_id": str(self.host_id),
            "players": [
                {"user_id": str(p.user_id), "name": p.name, "connected": p.connected}
                for p in self.players.values()
            ],
            "phase": self.phase,
        }

    # --- serialization (Room has no I/O of its own; a RoomStore persists
    # this dict, e.g. as one JSON blob in Redis) ---
    def to_state(self) -> dict:
        return {
            "code": self.code,
            "host_id": str(self.host_id),
            "players": [p.to_dict() for p in self.players.values()],
            "questions": self.questions,
            "phase": self.phase,
            "current": self.current,
            "mode": self.mode,
            "timer_seconds": self.timer_seconds,
            "round_started_at": self.round_started_at,
            "round_ends_at": self.round_ends_at,
            "countdown_ends_at": self.countdown_ends_at,
            "result_ends_at": self.result_ends_at,
            "leaderboard_ends_at": self.leaderboard_ends_at,
            "finished_at": self.finished_at,
            "answers": [a.to_dict() for a in self.answers],
            "last_ranks": {str(k): v for k, v in self._last_ranks.items()},
            "leaderboard_rows": self._leaderboard_rows,
            "session_db_id": self.session_db_id,
        }

    @classmethod
    def from_state(cls, data: dict, clock: Callable[[], float] = time.time) -> "Room":
        room = cls(data["code"], UUID(data["host_id"]), clock=clock)
        for player_data in data["players"]:
            player = Player.from_dict(player_data)
            room.players[player.user_id] = player
        room.questions = data["questions"]
        room.phase = data["phase"]
        room.current = data["current"]
        room.mode = data["mode"]
        room.timer_seconds = data["timer_seconds"]
        room.round_started_at = data["round_started_at"]
        room.round_ends_at = data["round_ends_at"]
        room.countdown_ends_at = data["countdown_ends_at"]
        room.result_ends_at = data["result_ends_at"]
        room.leaderboard_ends_at = data["leaderboard_ends_at"]
        room.finished_at = data["finished_at"]
        room.answers = [RoundAnswer.from_dict(a) for a in data["answers"]]
        room._last_ranks = {UUID(k): v for k, v in data["last_ranks"].items()}
        room._leaderboard_rows = data["leaderboard_rows"]
        room.session_db_id = data["session_db_id"]
        return room


def generate_room_code() -> str:
    """A fresh 4-char code. Collision-checking against live rooms is the
    caller's job (api/v1/multiplayer.py retries against the RoomStore, which
    is the actual source of truth for which codes are taken — a code minted
    here is only ever a candidate)."""
    return "".join(secrets.choice(_ROOM_ALPHABET) for _ in range(4))
