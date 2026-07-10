"""Unit tests for the multiplayer Room logic (no WebSocket transport)."""
from uuid import uuid4

from app.services.multiplayer import CORRECT_POINTS, Player, Room, RoomManager

QUESTIONS = [
    {"prompt": "apple", "options": ["olma", "non", "suv", "choy"], "answer_index": 0},
    {"prompt": "water", "options": ["olma", "suv", "non", "choy"], "answer_index": 1},
]


def test_room_lifecycle_and_scoring():
    room = Room("ABCD", host_id=uuid4())
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
    room = Room("WXYZ", host_id=uuid4())
    p = Player(uuid4(), "P")
    room.add_player(p)
    room.start(QUESTIONS)
    room.submit_answer(p.user_id, 0, 0)  # correct
    room.submit_answer(p.user_id, 0, 1)  # ignored — already answered
    assert p.score == CORRECT_POINTS


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
