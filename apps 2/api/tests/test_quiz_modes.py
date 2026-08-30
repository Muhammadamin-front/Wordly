"""Multiplayer quiz categories: grammar bank, pairs quiz, mode dispatcher."""
import pytest

import app.db.session as db_session
from app.services.games import build_quiz
from app.services.grammar import QUESTIONS, grammar_questions
from app.services.multiplayer import Player, Room
from tests.test_games import learner_with_cards  # seeds published corpus words
from tests.test_vocabulary import WORD_PAYLOAD, make_admin


# --- Grammar bank ------------------------------------------------------------


def test_grammar_bank_is_well_formed():
    for level, bank in QUESTIONS.items():
        assert len(bank) >= 10, level
        for q in bank:
            assert len(q["options"]) == 4
            assert 0 <= q["answer_index"] < 4
            assert len(set(q["options"])) == 4, q["prompt"]  # no duplicate options


def test_grammar_questions_shuffle_but_keep_answer():
    rounds = grammar_questions("A2", 8)
    assert len(rounds) == 8
    bank_by_prompt = {q["prompt"]: q for q in QUESTIONS["A2"]}
    for r in rounds:
        original = bank_by_prompt[r["prompt"]]
        correct = original["options"][original["answer_index"]]
        assert r["options"][r["answer_index"]] == correct
        assert sorted(r["options"]) == sorted(original["options"])


def test_grammar_unknown_level_falls_back():
    rounds = grammar_questions("C2", 5)
    assert len(rounds) == 5


# --- Pairs quiz --------------------------------------------------------------


async def seed_related_words(client, count=8):
    """Published words that all share synonym/antonym relations."""
    admin_headers = await make_admin(client)
    for i in range(count):
        payload = {
            **WORD_PAYLOAD,
            "headword": "pairword{}".format(i),
            "frequency_rank": 500 + i,
            "relations": [
                {"relation_type": "synonym", "related_text": "same{}".format(i)},
                {"relation_type": "antonym", "related_text": "opposite{}".format(i)},
            ],
        }
        response = await client.post("/api/v1/admin/words", json=payload, headers=admin_headers)
        assert response.status_code == 201, response.text


async def test_pairs_quiz_from_relations(client):
    await seed_related_words(client)
    async with db_session._session_factory() as db:
        questions = await build_quiz(db, "pairs", "A1", count=6)
    assert len(questions) >= 4
    for q in questions:
        assert q["prompt"][0] in ("≈", "≠")
        assert len(q["options"]) == 4
        answer = q["options"][q["answer_index"]]
        expected_prefix = "same" if q["prompt"].startswith("≈") else "opposite"
        assert answer.startswith(expected_prefix)


async def test_pairs_quiz_empty_without_relations(client):
    # Corpus words exist (via learner_with_cards) but none have relations.
    await learner_with_cards(client, count=4)
    async with db_session._session_factory() as db:
        questions = await build_quiz(db, "pairs", "A1", count=6)
    assert questions == []


# --- Dispatcher & room mode ---------------------------------------------------


async def test_mixed_mode_combines_sources(client):
    await seed_related_words(client)
    await learner_with_cards(client, count=6)
    async with db_session._session_factory() as db:
        questions = await build_quiz(db, "mixed", "A1", count=8)
    assert len(questions) == 8
    prompts = " | ".join(q["prompt"] for q in questions)
    # At least one grammar blank should be in the mix alongside corpus prompts.
    assert "___" in prompts


def test_room_broadcasts_mode():
    import uuid

    host = uuid.uuid4()
    room = Room("TEST", host)
    room.add_player(Player(host, "Host"))
    room.mode = "grammar"
    room.start([{"prompt": "I ___ happy.", "options": ["am", "is"], "answer_index": 0}])
    question = room.current_question()
    assert question["mode"] == "grammar"
    assert "answer_index" not in question
