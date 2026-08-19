"""Every bank question must explain its answer, and quote the passage honestly.

Grading used to reveal only which option was correct. The static Reading
practice had carried an explanation and an evidence quote per question all
along, so the same learner got two very different experiences depending on
which entry point they used.

The second test here guards the defect found in the generated reading tests,
where an item quoted "No cost is stated in the passage." as its evidence —
words that appeared nowhere in the passage the learner was told to search.
"""
import re

import pytest

from app.services.ielts_bank import LISTENING_BANK, READING_BANK

ALL_ITEMS = [(item, "reading") for item in READING_BANK] + [
    (item, "listening") for item in LISTENING_BANK
]


def normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("’", "'")).strip().lower()


def quoted_fragments(explanation: str):
    """Fragments the explanation presents as verbatim quotes.

    A quote mark opens only after a non-word character and closes only before
    one, so the possessive in "the wind's rhythm" is not mistaken for a
    delimiter. Ellipses mark elision, so each side is checked separately.
    """
    for quote in re.findall(r"(?<!\w)'([^']{12,})'(?!\w)", explanation):
        for part in re.split(r"\.\.\.|…", quote):
            if len(part.strip()) > 10:
                yield part.strip()


@pytest.mark.parametrize("item,kind", ALL_ITEMS, ids=lambda v: v if isinstance(v, str) else v["id"])
def test_every_question_has_an_explanation(item, kind):
    for index, question in enumerate(item["questions"], 1):
        explanation = question.get("explanation", "")
        assert explanation.strip(), f"{item['id']} Q{index} has no explanation"
        assert len(explanation.split()) >= 6, f"{item['id']} Q{index} explanation is too thin"


@pytest.mark.parametrize("item,kind", ALL_ITEMS, ids=lambda v: v if isinstance(v, str) else v["id"])
def test_explanations_quote_the_passage(item, kind):
    body = normalise(item["body"])
    for index, question in enumerate(item["questions"], 1):
        for fragment in quoted_fragments(question["explanation"]):
            assert normalise(fragment) in body, (
                f"{item['id']} Q{index} quotes text absent from the passage: {fragment!r}"
            )


def test_the_whole_bank_is_covered():
    total = sum(len(item["questions"]) for item, _ in ALL_ITEMS)
    assert total == 122
    assert len(READING_BANK) == 12
    assert len(LISTENING_BANK) == 10


def test_answer_indexes_are_in_range():
    for item, _ in ALL_ITEMS:
        for index, question in enumerate(item["questions"], 1):
            assert 0 <= question["answer_index"] < len(question["options"]), (
                f"{item['id']} Q{index} answer_index out of range"
            )
