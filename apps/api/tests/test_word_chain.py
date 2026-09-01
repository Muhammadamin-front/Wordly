"""Core rule coverage for the isolated word-chain state machine."""

from uuid import uuid4

from app.services.word_chain import (
    WordChainConfig,
    WordChainPlayer,
    WordChainRoom,
    bot_choice,
    normalize_word,
)


class FakeClock:
    def __init__(self) -> None:
        self.now = 1_000.0

    def __call__(self) -> float:
        return self.now


def inventory(**overrides: int) -> dict[str, int]:
    counts = {letter: 100 for letter in "abcdefghijklmnopqrstuvwxyz"}
    counts.update(overrides)
    return counts


def started_room(player_count: int = 3, **config_overrides):
    clock = FakeClock()
    config = WordChainConfig(**config_overrides)
    host_id = uuid4()
    room = WordChainRoom("ABC123", host_id, config=config, clock=clock)
    players = [WordChainPlayer(host_id, "Alice")]
    players.extend(WordChainPlayer(uuid4(), f"Player {index}") for index in range(2, player_count + 1))
    for player in players:
        assert room.add_player(player)
    room.start(inventory(), starting_letter="b")
    return room, players, clock


def submit(room: WordChainRoom, player: WordChainPlayer, word: str):
    return room.submit_validated_word(player.user_id, word, dictionary_valid=True)


def test_normalization_is_case_insensitive_and_trims_outer_whitespace():
    assert normalize_word("  Blue  ") == "blue"


def test_valid_word_advances_chain_and_turn():
    room, players, _clock = started_room()
    result = submit(room, players[0], "BLUE")
    assert result.accepted is True
    assert room.last_word == "blue"
    assert room.required_letter == "e"
    assert room.current_player_id == players[1].user_id
    assert room.round_number == 2


def test_invalid_dictionary_word_does_not_consume_turn():
    room, players, _clock = started_room()
    result = room.submit_validated_word(players[0].user_id, "blorf", dictionary_valid=False)
    assert result.reason == "INVALID_WORD"
    assert room.current_player_id == players[0].user_id
    assert room.round_number == 1


def test_dictionary_outage_is_retryable_and_does_not_consume_turn():
    room, players, _clock = started_room()
    result = room.submit_validated_word(
        players[0].user_id, "blue", dictionary_valid=False, dictionary_available=False
    )
    assert result.reason == "DICTIONARY_UNAVAILABLE"
    assert room.used_words == []


def test_wrong_starting_letter_rejected_before_dictionary():
    room, players, _clock = started_room()
    result = submit(room, players[0], "apple")
    assert result.reason == "WRONG_LETTER"


def test_duplicate_is_case_insensitive():
    room, players, _clock = started_room()
    assert submit(room, players[0], "Blue").accepted
    assert submit(room, players[1], "Eagle").accepted
    assert submit(room, players[2], "Earth").accepted
    assert submit(room, players[0], "Horse").accepted
    assert submit(room, players[1], "Elephant").accepted
    assert submit(room, players[2], "Table").accepted
    room.required_letter = "b"
    result = submit(room, players[0], " blue ")
    assert result.reason == "DUPLICATE_WORD"


def test_empty_short_and_unsupported_inputs_have_specific_reasons():
    room, players, _clock = started_room()
    assert submit(room, players[0], " ").reason == "EMPTY_WORD"
    assert submit(room, players[0], "b2b").reason == "UNSUPPORTED_CHARACTERS"
    assert submit(room, players[0], "be").reason == "TOO_SHORT"


def test_wrong_player_and_eliminated_player_cannot_submit():
    room, players, clock = started_room(lives_per_player=1)
    assert submit(room, players[1], "blue").reason == "NOT_YOUR_TURN"
    clock.now = room.turn_ends_at or clock.now
    assert room.expire_current_turn()
    assert room.players[players[0].user_id].eliminated
    assert submit(room, players[0], "blue").reason in {"NOT_YOUR_TURN", "PLAYER_ELIMINATED"}


def test_timer_decreases_each_round_and_stops_at_minimum():
    room, players, _clock = started_room(
        starting_time=15, time_decrease_per_round=1, minimum_time=5
    )
    assert room.time_limit() == 15
    assert submit(room, players[0], "blue").accepted
    assert room.time_limit() == 14
    assert submit(room, players[1], "eagle").accepted
    assert room.time_limit() == 13
    room.round_number = 100
    assert room.time_limit() == 5


def test_submission_at_deadline_is_rejected():
    room, players, clock = started_room()
    clock.now = room.turn_ends_at or clock.now
    assert submit(room, players[0], "blue").reason == "TIME_EXPIRED"


def test_timeout_consumes_a_life_and_skips_to_the_next_player():
    room, players, clock = started_room()
    clock.now = room.turn_ends_at or clock.now
    assert room.expire_current_turn()
    assert room.players[players[0].user_id].eliminated is False
    assert room.players[players[0].user_id].lives_remaining == 1
    assert room.players[players[0].user_id].streak == 0
    assert room.current_player_id == players[1].user_id
    assert room.last_event and room.last_event["kind"] == "life_lost"


def test_second_timeout_eliminates_a_player_after_their_last_life():
    room, players, clock = started_room(lives_per_player=2)
    clock.now = room.turn_ends_at or clock.now
    assert room.expire_current_turn()  # Alice loses the first life.
    assert submit(room, players[1], "blue").accepted
    assert submit(room, players[2], "eagle").accepted
    assert room.current_player_id == players[0].user_id

    clock.now = room.turn_ends_at or clock.now
    assert room.expire_current_turn()
    assert room.players[players[0].user_id].eliminated is True
    assert room.players[players[0].user_id].lives_remaining == 0
    assert room.current_player_id == players[1].user_id


def test_disconnected_players_do_not_keep_the_last_connected_player_in_game():
    room, players, clock = started_room(lives_per_player=1)
    room.mark_disconnected(players[2].user_id)
    clock.now = room.turn_ends_at or clock.now

    assert room.expire_current_turn()
    assert room.status == "finished"
    assert room.winner_id == players[1].user_id
    assert room.public_state()["active_players"] == 1


def test_late_socket_close_cannot_disconnect_a_newer_reconnection():
    room, players, _clock = started_room()
    player = players[0]
    player.connection_id = "older-socket"
    assert room.add_player(WordChainPlayer(player.user_id, "Alice", connection_id="newer-socket"))

    assert room.mark_disconnected(player.user_id, "older-socket") is False
    assert room.players[player.user_id].connected is True
    assert room.mark_disconnected(player.user_id, "newer-socket") is True


def test_online_room_exposes_safe_matchmaking_state_and_persists_it():
    host = WordChainPlayer(uuid4(), "Alice")
    opponent = WordChainPlayer(uuid4(), "Bob")
    room = WordChainRoom("MATCH1", host.user_id, online_match=True)
    assert room.add_player(host)

    assert room.public_state()["matchmaking_status"] == "searching"

    assert room.add_player(opponent)
    assert room.public_state()["matchmaking_status"] == "matched"

    restored = WordChainRoom.from_state(room.to_state())
    assert restored.online_match is True
    assert restored.public_state()["matchmaking_status"] == "matched"


def test_eliminated_player_is_skipped_on_clockwise_wrap():
    room, players, clock = started_room(lives_per_player=1)
    clock.now = room.turn_ends_at or clock.now
    room.expire_current_turn()  # Alice out; Player 2's turn
    assert submit(room, players[1], "blue").accepted
    assert room.current_player_id == players[2].user_id
    assert submit(room, players[2], "eagle").accepted
    assert room.current_player_id == players[1].user_id


def test_chain_examples_blue_elephant_table():
    room, players, _clock = started_room()
    assert submit(room, players[0], "blue").next_letter == "e"
    assert submit(room, players[1], "elephant").next_letter == "t"
    assert submit(room, players[2], "table").next_letter == "e"


def test_gray_uses_y_when_y_has_enough_words():
    room, players, _clock = started_room()
    room.required_letter = "g"
    assert submit(room, players[0], "gray").next_letter == "y"


def test_gray_falls_back_to_a_when_y_is_restricted():
    room, players, _clock = started_room()
    room.required_letter = "g"
    room.letter_available_words["y"] = room.config.difficult_letter_threshold
    result = submit(room, players[0], "gray")
    assert result.next_letter == "a"
    assert room.last_event and room.last_event["fallback_used"] is True


def test_fallback_is_generic_not_a_y_special_case():
    room, players, _clock = started_room()
    room.required_letter = "m"
    room.letter_available_words["x"] = 1
    assert submit(room, players[0], "matrix").next_letter == "i"


def test_letter_statistics_track_available_used_remaining_and_restricted():
    room, players, _clock = started_room()
    room.letter_available_words["b"] = 2
    assert submit(room, players[0], "blue").accepted
    stats = room.letter_stats("b")
    assert stats == {
        "letter": "B",
        "available_words": 2,
        "used_words": 1,
        "remaining_words": 1,
        "is_restricted": True,
    }


def test_last_remaining_player_wins_with_summary_timestamps():
    room, players, clock = started_room(lives_per_player=1)
    clock.now = room.turn_ends_at or clock.now
    room.expire_current_turn()
    clock.now = room.turn_ends_at or clock.now
    room.expire_current_turn()
    assert room.status == "finished"
    assert room.winner_id == players[2].user_id
    state = room.public_state()
    assert state["winner_id"] == str(players[2].user_id)
    assert state["duration_seconds"] is not None


def test_bot_choice_obeys_letter_and_never_repeats():
    choice = bot_choice(["Apple", "eagle", "earth", "eon"], "e", ["EAGLE", "eon"])
    assert choice == "earth"


def test_bot_is_eliminated_when_no_word_is_available():
    clock = FakeClock()
    host = WordChainPlayer(uuid4(), "Alice")
    bot = WordChainPlayer(uuid4(), "Lexi Bot", is_bot=True)
    room = WordChainRoom("BOT123", host.user_id, clock=clock)
    room.add_player(host)
    room.add_player(bot)
    room.start(inventory(), starting_letter="b")
    assert submit(room, host, "blue").accepted
    assert room.current_player_id == bot.user_id
    assert room.eliminate_bot_without_word(bot.user_id)
    assert room.status == "finished"
    assert room.winner_id == host.user_id


def test_room_state_round_trips_without_losing_game_data():
    room, players, clock = started_room()
    submit(room, players[0], "blue")
    restored = WordChainRoom.from_state(room.to_state(), clock=clock)
    assert restored.public_state() == room.public_state()


def test_completed_challenge_boosts_a_player_streak_without_blocking_normal_words():
    room, players, _clock = started_room()
    room.challenge = {"kind": "minimum_vowels", "target": 2}

    result = submit(room, players[0], "blue")

    assert result.accepted is True
    assert room.players[players[0].user_id].streak == 2
    assert room.last_event and room.last_event["challenge_completed"] is True


def test_three_word_combo_adds_time_to_that_players_next_turn():
    room, players, clock = started_room(
        starting_time=15, streak_bonus_threshold=3, streak_time_bonus=2
    )
    player = room.players[players[0].user_id]
    player.streak = 3
    room.current_player_id = player.user_id
    room._start_turn(clock.now)

    assert room.time_limit() == 15
    assert room.current_turn_time_limit() == 17
    assert room.turn_ends_at == clock.now + 17
