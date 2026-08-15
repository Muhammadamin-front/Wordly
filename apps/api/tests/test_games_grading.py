"""Regression tests for game grading and quest progress.

Each case here failed before: blanks were cut out of the middle of unrelated
words, a second correct synonym could be offered as a distractor, "cat" was
accepted inside "concatenate", and quest progress advanced from games the quest
card never mentioned.
"""
from datetime import datetime

import pytest

from app.models.gamification import GameRun
from app.services.games import _blank_sentence, _crossword_clue, _word_pattern
from app.services.quests import QuestDefinition, ROTATING_QUESTS, _progress_for


class _Sense:
    def __init__(self, definition_en, translation_uz="tarjima"):
        self.definition_en = definition_en
        self.translation_uz = translation_uz
        self.examples = []


class _Word:
    def __init__(self, headword, definition_en):
        self.headword = headword
        self.senses = [_Sense(definition_en)]


class _Card:
    def __init__(self, headword, definition_en=""):
        self.word = _Word(headword, definition_en)


@pytest.mark.parametrize(
    "example, headword, expected",
    [
        # The defects: "art" matched inside "started", "run" inside "running".
        ("We started the project early.", "art", None),
        ("He is running to the shop.", "run", None),
        ("They run every morning.", "run", "They ____ every morning."),
        ("Art matters to this city.", "art", "____ matters to this city."),
        ("A beautiful work of art.", "art", "A beautiful work of ____."),
        ("She will take part in it.", "part", "She will take ____ in it."),
        # Multi-word headwords still match.
        ("Please carry on without me.", "carry on", "Please ____ without me."),
    ],
)
def test_blank_sentence_matches_whole_words_only(example, headword, expected):
    assert _blank_sentence(example, headword) == expected


def test_blank_sentence_returns_none_for_missing_headword():
    assert _blank_sentence("Nothing relevant here.", "absent") is None
    assert _blank_sentence("", "absent") is None


def test_crossword_clue_does_not_mask_substrings():
    card = _Card("art", "A part of human culture that uses art to express ideas.")
    clue = _crossword_clue(card)
    assert "p___" not in clue  # "part" must survive
    assert "part" in clue
    assert "___" in clue  # the standalone "art" is masked


def test_word_pattern_is_case_insensitive_and_bounded():
    pattern = _word_pattern("cat")
    assert pattern.search("The Cat sat") is not None
    assert pattern.search("concatenate") is None
    assert pattern.search("cats") is None


def _run(game_type, *, correct=0, total=0, combo=0, completed=True, category=None):
    return GameRun(
        game_type=game_type,
        correct_count=correct,
        total_questions=total,
        best_combo=combo,
        source_category=category,
        completed_at=datetime(2026, 1, 1) if completed else None,
    )


def test_quest_progress_ignores_other_games():
    """The card links to one game; only that game may advance it."""
    definition = QuestDefinition("match_1", 1, 20, "word_match")
    assert _progress_for(definition, [_run("hangman")]) == 0
    assert _progress_for(definition, [_run("word_match")]) == 1


def test_quest_progress_requires_a_finished_run():
    definition = QuestDefinition("match_1", 1, 20, "word_match")
    assert _progress_for(definition, [_run("word_match", completed=False)]) == 0


def test_quest_progress_respects_the_source_category():
    definition = QuestDefinition("phrasal_5", 5, 25, "speed_quiz", "phrasal")
    assert _progress_for(definition, [_run("speed_quiz", correct=5)]) == 0
    assert (
        _progress_for(definition, [_run("speed_quiz", correct=5, category="phrasal")]) == 5
    )


def test_combo_quest_reads_the_best_run_of_that_game():
    definition = QuestDefinition("combo_3", 3, 15, "speed_quiz")
    runs = [_run("speed_quiz", combo=2), _run("speed_quiz", combo=4), _run("memory", combo=9)]
    assert _progress_for(definition, runs) == 4


def test_perfect_round_must_be_perfect_and_finished():
    definition = QuestDefinition("perfect_1", 1, 30, "speed_quiz")
    assert _progress_for(definition, [_run("speed_quiz", correct=4, total=5)]) == 0
    assert _progress_for(definition, [_run("speed_quiz", correct=5, total=5)]) == 1
    assert _progress_for(definition, [_run("speed_quiz", correct=0, total=0)]) == 0


def test_rotating_quest_codes_are_unique():
    """Claims are keyed by code, so a shared code would collide."""
    codes = [definition.code for definition in ROTATING_QUESTS]
    assert len(set(codes)) == len(codes)
    assert len(ROTATING_QUESTS) == 7  # one per weekday
