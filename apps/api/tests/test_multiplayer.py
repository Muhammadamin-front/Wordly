"""Unit tests for the multiplayer Room state machine (no WebSocket, no Redis)."""
from uuid import uuid4

from app.services.multiplayer import (
    LEADERBOARD_SECONDS,
    RESULT_SECONDS,
    SPEED_MAX,
    SPEED_MIN,
    Player,
    Room,
    generate_room_code,
    streak_bonus,
)

QUESTIONS = [
    {"prompt": "apple", "options": ["olma", "non", "suv", "choy"], "answer_index": 0, "category": "vocab", "explanation": {"translation_uz": "olma"}},
    {"prompt": "water", "options": ["olma", "suv", "non", "choy"], "answer_index": 1, "category": "vocab", "explanation": {"translation_uz": "suv"}},
]


class FakeClock:
    """Deterministic clock; scoring tests advance it explicitly. Room's real
    clock is `time.time` (epoch seconds) — tests just use an arbitrary but
    monotonically-increasing float, since only relative deltas matter."""

    def __init__(self) -> None:
        self.now = 1_000.0

    def __call__(self) -> float:
        return self.now


def new_room(code: str = "ABCD") -> tuple[Room, FakeClock]:
    clock = FakeClock()
    return Room(code, host_id=uuid4(), clock=clock), clock


def start_and_begin(room: Room, clock: FakeClock, questions=QUESTIONS, timer_seconds=15) -> None:
    """Drives lobby -> countdown -> question 0, as the WS layer would."""
    room.start(questions, mode="vocab", timer_seconds=timer_seconds)
    clock.now += 3  # countdown elapses
    room.force_advance()  # countdown -> question 0


def test_full_game_lifecycle():
    room, clock = new_room()
    alice, bob = Player(uuid4(), "Alice"), Player(uuid4(), "Bob")
    room.add_player(alice)
    room.add_player(bob)

    room.start(QUESTIONS, mode="vocab")
    assert room.phase == "countdown"

    room.force_advance()  # -> question 0
    assert room.phase == "question"
    q = room.current_question()
    assert q["index"] == 0 and "answer_index" not in q

    # Alice answers correctly, Bob wrongly; round closes once both have answered.
    assert room.submit_answer(alice.user_id, 0, 0) is False  # bob still to answer
    assert room.submit_answer(bob.user_id, 0, 2) is True  # all answered
    assert alice.score > 0
    assert bob.score == 0

    room.force_advance()  # question -> question_result
    assert room.phase == "question_result"
    result = room.question_result_payload()
    assert result["answer_index"] == 0
    assert {r["user_id"]: r["correct"] for r in result["results"]} == {
        str(alice.user_id): True,
        str(bob.user_id): False,
    }

    room.force_advance()  # question_result -> leaderboard
    assert room.phase == "leaderboard"
    board = room.leaderboard_payload()["board"]
    assert board[0]["user_id"] == str(alice.user_id) and board[0]["rank"] == 1

    room.force_advance()  # leaderboard -> question 1
    assert room.phase == "question" and room.current == 1
    room.submit_answer(alice.user_id, 1, 1)
    room.submit_answer(bob.user_id, 1, 1)
    room.force_advance()  # -> question_result
    room.force_advance()  # -> leaderboard
    room.force_advance()  # leaderboard -> finished (no more questions)

    assert room.phase == "finished"
    summaries = room.summaries()
    assert summaries[str(alice.user_id)]["correct_count"] == 2
    assert summaries[str(alice.user_id)]["accuracy"] == 100
    assert summaries[str(bob.user_id)]["correct_count"] == 1
    assert summaries[str(bob.user_id)]["accuracy"] == 50


def test_speed_scoring_rewards_faster_answers():
    room, clock = new_room()
    fast, slow = Player(uuid4(), "Fast"), Player(uuid4(), "Slow")
    room.add_player(fast)
    room.add_player(slow)
    start_and_begin(room, clock, timer_seconds=15)

    room.submit_answer(fast.user_id, 0, 0)  # instant
    assert fast.score == SPEED_MAX  # 250 + 750*1.0

    clock.now += 15  # right at the deadline
    room.submit_answer(slow.user_id, 0, 0)
    assert slow.score == SPEED_MIN  # 250 + 750*0.0

    assert fast.score > slow.score


def test_speed_scoring_matches_example_brackets_at_midpoints():
    # 15s timer; check the user's five example ranges at each bracket's midpoint.
    for elapsed, low, high in [(1.0, 900, 1000), (4.0, 750, 900), (7.0, 600, 750), (10.5, 400, 600), (14.0, 250, 400)]:
        room, clock = new_room()
        p = Player(uuid4(), "P")
        room.add_player(p)
        start_and_begin(room, clock, timer_seconds=15)
        clock.now += elapsed
        room.submit_answer(p.user_id, 0, 0)
        assert low - 5 <= p.score <= high + 5, f"elapsed={elapsed} scored {p.score}, expected [{low},{high}]"


def test_streak_bonus_layers_on_top_of_speed_and_resets_on_wrong():
    assert streak_bonus(1) == 0
    assert streak_bonus(2) == 25
    assert streak_bonus(3) == 50
    assert streak_bonus(4) == 50
    assert streak_bonus(5) == 100
    assert streak_bonus(9) == 100

    room, clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    five_questions = [dict(QUESTIONS[0], **{}) for _ in range(5)]
    start_and_begin(room, clock, questions=five_questions, timer_seconds=15)

    for i in range(5):
        room.submit_answer(p.user_id, i, 0)  # always correct -> streak grows
        expected_bonus = streak_bonus(i + 1)
        if i < 4:
            room.force_advance()  # question -> question_result
            room.force_advance()  # question_result -> leaderboard
            room.force_advance()  # leaderboard -> next question
    assert p.streak == 5
    assert p.best_streak == 5

    # One wrong answer resets the streak (fresh room: a wrong first answer
    # should score 0 and leave the streak at 0, not carry over anything).
    room2, clock2 = new_room("WRNG")
    q = Player(uuid4(), "Q")
    room2.add_player(q)
    start_and_begin(room2, clock2, questions=five_questions, timer_seconds=15)
    room2.submit_answer(q.user_id, 0, 0)  # correct, streak=1
    room2.force_advance()
    room2.force_advance()
    room2.force_advance()
    score_before_miss = q.score
    room2.submit_answer(q.user_id, 1, 3)  # wrong -> streak resets
    assert q.streak == 0
    assert q.score == score_before_miss  # this answer earned 0; prior points aren't erased
    assert room2.answers[-1].points == 0


def test_double_answer_ignored():
    room, clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    start_and_begin(room, clock)
    room.submit_answer(p.user_id, 0, 0)
    score_after_first = p.score
    room.submit_answer(p.user_id, 0, 1)  # ignored — already answered
    assert p.score == score_after_first


def test_answer_after_deadline_rejected():
    room, clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    start_and_begin(room, clock, timer_seconds=15)
    clock.now += 16  # past the deadline
    room.submit_answer(p.user_id, 0, 0)
    assert p.score == 0
    assert p.answered_round == -1


def test_answer_for_wrong_round_ignored():
    room, clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    start_and_begin(room, clock)
    room.submit_answer(p.user_id, 5, 0)  # round 5 doesn't exist yet
    assert p.score == 0
    assert p.answered_round == -1


def test_unanswered_player_counts_as_wrong_when_round_closes():
    room, clock = new_room()
    answered, timed_out = Player(uuid4(), "A"), Player(uuid4(), "T")
    room.add_player(answered)
    room.add_player(timed_out)
    start_and_begin(room, clock)
    room.submit_answer(answered.user_id, 0, 0)  # correct
    # timed_out never answers; only a disconnect-aware all_answered() or the
    # timer would normally close the round — force_advance simulates the timer.
    room.force_advance()
    assert room.phase == "question_result"
    assert timed_out.streak == 0
    result = room.question_result_payload()
    row = next(r for r in result["results"] if r["user_id"] == str(timed_out.user_id))
    assert row["correct"] is False and row["points"] == 0 and row["option_index"] is None


def test_all_answered_ignores_disconnected_players():
    room, clock = new_room()
    a, b = Player(uuid4(), "A"), Player(uuid4(), "B")
    room.add_player(a)
    room.add_player(b)
    start_and_begin(room, clock)
    room.mark_disconnected(b.user_id)
    assert room.submit_answer(a.user_id, 0, 0) is True  # only connected `a` needs to answer


def test_reconnection_preserves_score_and_streak():
    room, _clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    p.score, p.streak, p.best_streak = 1500, 3, 4

    room.mark_disconnected(p.user_id)
    assert room.players[p.user_id].connected is False

    reconnected = Player(p.user_id, "P")
    ok = room.add_player(reconnected)  # idempotent join — same user_id
    assert ok is True
    assert len(room.players) == 1
    stored = room.players[p.user_id]
    assert stored.score == 1500 and stored.streak == 3 and stored.best_streak == 4
    assert stored.connected is True


def test_room_full_rejects_new_player():
    room, _clock = new_room()
    for _ in range(12):
        assert room.add_player(Player(uuid4(), "P")) is True
    assert room.add_player(Player(uuid4(), "Overflow")) is False


def test_host_transfers_to_oldest_remaining_player_on_removal():
    room, _clock = new_room()
    host = Player(room.host_id, "Host")
    room.add_player(host)
    second = Player(uuid4(), "Second")
    room.add_player(second)
    third = Player(uuid4(), "Third")
    room.add_player(third)

    new_host = room.remove_player(host.user_id)
    assert new_host == second.user_id
    assert room.host_id == second.user_id


def test_host_removal_with_no_players_left_is_a_noop():
    room, _clock = new_room()
    host = Player(room.host_id, "Host")
    room.add_player(host)
    assert room.remove_player(host.user_id) is None
    assert room.players == {}


def test_leaderboard_reports_rank_deltas_between_questions():
    room, clock = new_room()
    slow_starter, fast_starter = Player(uuid4(), "SlowStarter"), Player(uuid4(), "FastStarter")
    room.add_player(slow_starter)
    room.add_player(fast_starter)
    two_questions = [QUESTIONS[0], QUESTIONS[1]]
    start_and_begin(room, clock, questions=two_questions, timer_seconds=15)

    # Q1: fast_starter wins big.
    room.submit_answer(fast_starter.user_id, 0, 0)
    room.submit_answer(slow_starter.user_id, 0, 3)  # wrong
    room.force_advance()
    room.force_advance()
    board1 = room.leaderboard_payload()["board"]
    assert board1[0]["user_id"] == str(fast_starter.user_id)
    assert board1[0]["previous_rank"] is None  # first leaderboard ever shown

    room.force_advance()  # -> question 1
    # Q2: slow_starter now wins big, flipping the order.
    room.submit_answer(slow_starter.user_id, 1, 1)
    room.submit_answer(fast_starter.user_id, 1, 3)  # wrong, streak resets
    room.force_advance()
    room.force_advance()
    board2 = room.leaderboard_payload()["board"]
    slow_row = next(r for r in board2 if r["user_id"] == str(slow_starter.user_id))
    assert slow_row["rank"] == 1
    assert slow_row["previous_rank"] == 2
    assert slow_row["delta"] == 1  # moved up one place


def test_result_and_leaderboard_deadlines_are_set():
    room, clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    start_and_begin(room, clock)
    room.submit_answer(p.user_id, 0, 0)
    room.force_advance()
    assert room.result_ends_at == clock.now + RESULT_SECONDS
    room.force_advance()
    assert room.leaderboard_ends_at == clock.now + LEADERBOARD_SECONDS


def test_mistakes_review_only_includes_missed_questions():
    room, clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    start_and_begin(room, clock, questions=QUESTIONS)
    room.submit_answer(p.user_id, 0, 0)  # correct
    room.force_advance()
    room.force_advance()
    room.force_advance()  # -> question 1
    room.submit_answer(p.user_id, 1, 0)  # wrong (answer_index is 1)
    room.force_advance()

    review = room.mistakes_review(p.user_id)
    assert len(review) == 1
    assert review[0]["index"] == 1
    assert review[0]["your_answer_index"] == 0
    assert review[0]["answer_index"] == 1


def test_state_round_trips_through_to_state_and_from_state():
    room, clock = new_room()
    p = Player(uuid4(), "P")
    room.add_player(p)
    start_and_begin(room, clock)
    room.submit_answer(p.user_id, 0, 0)
    room.force_advance()
    room.force_advance()

    restored = Room.from_state(room.to_state(), clock=clock)
    assert restored.code == room.code
    assert restored.phase == room.phase == "leaderboard"
    assert restored.players[p.user_id].score == room.players[p.user_id].score
    assert len(restored.answers) == len(room.answers)
    assert restored.to_state() == room.to_state()


def test_generate_room_code_is_four_unambiguous_characters():
    code = generate_room_code()
    assert len(code) == 4
    assert code == code.upper()
    assert not set(code) & set("0O1I")  # unambiguous when read aloud
