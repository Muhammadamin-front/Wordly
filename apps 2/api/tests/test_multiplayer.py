"""Unit tests for the multiplayer Room logic (no WebSocket transport)."""
from uuid import uuid4

from app.services.multiplayer import (
    CORRECT_POINTS,
    SPEED_BONUS_MAX,
    SPEED_WINDOW,
    Player,
    Room,
    RoomManager,
)

QUESTIONS = [
    {"prompt": "apple", "options": ["olma", "non", "suv", "choy"], "answer_index": 0},
    {"prompt": "water", "options": ["olma", "suv", "non", "choy"], "answer_index": 1},
]


class FakeClock:
    """Deterministic clock; scoring tests advance it explicitly."""

    def __init__(self) -> None:
        self.now = 100.0

    def __call__(self) -> float:
        return self.now


def slow_room(code: str) -> tuple[Room, FakeClock]:
    """A room whose answers always arrive after the speed window (no bonus),
    so base-scoring assertions stay exact."""
    clock = FakeClock()
    room = Room(code, host_id=uuid4(), clock=clock)
    original_start, original_advance = room.start, room.advance

    def start(questions):
        original_start(questions)
        clock.now += SPEED_WINDOW

    def advance():
        ok = original_advance()
        clock.now += SPEED_WINDOW
        return ok

    room.start, room.advance = start, advance
    return room, clock


def test_room_lifecycle_and_scoring():
    room, _ = slow_room("ABCD")
    alice, bob = Player(uuid4(), "Alice"), Player(uuid4(), "Bob")
    room.add_player(alice)
    room.add_player(bob)

    room.start(QUESTIONS)
    assert room.phase == "playing"
    q = room.current_question()
    assert q["index"] == 0 and "answer_index" not in q  # answer never leaked

    # Alice answers correctly, Bob wrongly. Round completes when both answer.
    assert room.submit_answer(alice.user_id, 0, 0) is False  # bob still to answer
    assert room.submit_answer(bob.user_id, 0, 2) is True  # all answered
    assert alice.score == CORRECT_POINTS
    assert bob.score == 0

    board = room.scoreboard()
    assert board[0]["name"] == "Alice" and board[0]["rank"] == 1

    # Advance to question 2, both answer correctly.
    assert room.advance() is True
    room.submit_answer(alice.user_id, 1, 1)
    room.submit_answer(bob.user_id, 1, 1)
    assert alice.score == 2 * CORRECT_POINTS
    assert bob.score == CORRECT_POINTS

    # No more questions -> finished.
    assert room.advance() is False
    assert room.phase == "finished"


def test_double_answer_ignored():
    room, _ = slow_room("WXYZ")
    p = Player(uuid4(), "P")
    room.add_player(p)
    room.start(QUESTIONS)
    room.submit_answer(p.user_id, 0, 0)  # correct
    room.submit_answer(p.user_id, 0, 1)  # ignored — already answered
    assert p.score == CORRECT_POINTS


def test_speed_bonus_decays_with_time():
    clock = FakeClock()
    room = Room("FAST", host_id=uuid4(), clock=clock)
    room.add_player(Player(uuid4(), "P"))
    room.start(QUESTIONS)

    assert room.speed_bonus() == SPEED_BONUS_MAX  # instant answer
    clock.now += 3.0
    assert room.speed_bonus() == 3  # (10 - 3) // 2
    clock.now += 4.0
    assert room.speed_bonus() == 1  # (10 - 7) // 2
    clock.now += SPEED_WINDOW
    assert room.speed_bonus() == 0  # window expired


def test_fast_correct_answer_scores_base_plus_bonus():
    clock = FakeClock()
    room = Room("BONS", host_id=uuid4(), clock=clock)
    fast, slow = Player(uuid4(), "Fast"), Player(uuid4(), "Slow")
    room.add_player(fast)
    room.add_player(slow)
    room.start(QUESTIONS)

    room.submit_answer(fast.user_id, 0, 0)  # instant: full bonus
    clock.now += SPEED_WINDOW
    room.submit_answer(slow.user_id, 0, 0)  # too late for any bonus
    assert fast.score == CORRECT_POINTS + SPEED_BONUS_MAX
    assert slow.score == CORRECT_POINTS

    # The clock resets on advance — the next round has a fresh window.
    room.advance()
    assert room.speed_bonus() == SPEED_BONUS_MAX


def test_answer_for_wrong_round_ignored():
    room = Room("QQQQ", host_id=uuid4())
    p = Player(uuid4(), "P")
    room.add_player(p)
    room.start(QUESTIONS)
    # Submitting for round 5 while on round 0 doesn't score.
    room.submit_answer(p.user_id, 5, 0)
    assert p.score == 0
    assert p.answered_round == -1


def test_room_manager_create_and_get():
    mgr = RoomManager()
    room = mgr.create(uuid4())
    assert len(room.code) == 4
    assert mgr.get(room.code.lower()) is room  # case-insensitive lookup
    mgr.drop(room.code)
    assert mgr.get(room.code) is None


def test_remove_last_player():
    room = Room("ZZZZ", host_id=uuid4())
    a = Player(uuid4(), "A")
    room.add_player(a)
    room.remove_player(a.user_id)
    assert room.players == {}
