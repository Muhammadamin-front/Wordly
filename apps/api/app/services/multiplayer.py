"""In-memory real-time multiplayer quiz rooms.

The Room class holds all game logic and is fully unit-testable without any
WebSocket; the WS endpoint (api/v1/multiplayer.py) is a thin transport adapter
that drives a Room and broadcasts its messages. Single-process only — a Redis
pub/sub backplane is the scale-out path (see docs/milestones/M9.md).
"""
import secrets
from typing import Any, Callable, Dict, List, Optional
from uuid import UUID

CORRECT_POINTS = 10
_ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


class Player:
    def __init__(self, user_id: UUID, name: str, send: Optional[Callable] = None):
        self.user_id = user_id
        self.name = name
        self.send = send  # async callable(dict) -> None; None in tests
        self.score = 0
        self.answered_round = -1  # index of the round this player last answered


class Room:
    def __init__(self, code: str, host_id: UUID):
        self.code = code
        self.host_id = host_id
        self.players: Dict[UUID, Player] = {}
        self.questions: List[dict] = []
        self.phase = "lobby"  # lobby | playing | finished
        self.current = 0
        self.mode = "vocab"  # vocab | grammar | pairs | mixed

    # --- membership ---
    def add_player(self, player: Player) -> None:
        self.players[player.user_id] = player

    def remove_player(self, user_id: UUID) -> None:
        self.players.pop(user_id, None)

    # --- lifecycle ---
    def start(self, questions: List[dict]) -> None:
        self.questions = questions
        self.phase = "playing"
        self.current = 0
        for p in self.players.values():
            p.score = 0
            p.answered_round = -1

    def current_question(self) -> Optional[dict]:
        if self.phase != "playing" or self.current >= len(self.questions):
            return None
        q = self.questions[self.current]
        # Never leak the answer index to clients.
        return {
            "index": self.current,
            "total": len(self.questions),
            "prompt": q["prompt"],
            "options": q["options"],
            "mode": self.mode,
        }

    def submit_answer(self, user_id: UUID, round_index: int, option_index: int) -> bool:
        """Record an answer for the current round. Returns True when every
        player in the room has now answered this round."""
        player = self.players.get(user_id)
        if (
            player is None
            or self.phase != "playing"
            or round_index != self.current
            or player.answered_round == self.current
        ):
            return self.all_answered()
        player.answered_round = self.current
        if 0 <= option_index < len(self.questions[self.current]["options"]):
            if option_index == self.questions[self.current]["answer_index"]:
                player.score += CORRECT_POINTS
        return self.all_answered()

    def all_answered(self) -> bool:
        return bool(self.players) and all(
            p.answered_round == self.current for p in self.players.values()
        )

    def reveal(self) -> int:
        return self.questions[self.current]["answer_index"]

    def advance(self) -> bool:
        """Move to the next question. Returns False when the quiz is over."""
        self.current += 1
        if self.current >= len(self.questions):
            self.phase = "finished"
            return False
        return True

    def scoreboard(self) -> List[dict]:
        board = sorted(
            (
                {"user_id": str(p.user_id), "name": p.name, "score": p.score}
                for p in self.players.values()
            ),
            key=lambda r: r["score"],
            reverse=True,
        )
        for rank, row in enumerate(board, start=1):
            row["rank"] = rank
        return board

    def lobby_state(self) -> dict:
        return {
            "code": self.code,
            "host_id": str(self.host_id),
            "players": [{"user_id": str(p.user_id), "name": p.name} for p in self.players.values()],
            "phase": self.phase,
        }


class RoomManager:
    def __init__(self) -> None:
        self.rooms: Dict[str, Room] = {}

    def _new_code(self) -> str:
        while True:
            code = "".join(secrets.choice(_ROOM_ALPHABET) for _ in range(4))
            if code not in self.rooms:
                return code

    def create(self, host_id: UUID) -> Room:
        room = Room(self._new_code(), host_id)
        self.rooms[room.code] = room
        return room

    def get(self, code: str) -> Optional[Room]:
        return self.rooms.get(code.strip().upper())

    def drop(self, code: str) -> None:
        self.rooms.pop(code, None)


manager = RoomManager()


async def broadcast(room: Room, message: Dict[str, Any]) -> None:
    for player in list(room.players.values()):
        if player.send is not None:
            try:
                await player.send(message)
            except Exception:
                room.remove_player(player.user_id)
