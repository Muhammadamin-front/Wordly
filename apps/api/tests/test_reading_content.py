"""Regression checks for the curated CEFR reading library seed data."""
import json
from collections import Counter
from pathlib import Path


DATA_PATH = Path(__file__).parents[1] / "scripts" / "data" / "reading_passages.json"


def test_reading_library_is_balanced_and_complete():
    passages = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    levels = Counter(passage["cefr_level"] for passage in passages)

    assert len(passages) >= 20
    assert {"A1", "A2", "B1", "B2"}.issubset(levels)
    assert all(levels[level] >= 3 for level in ("A1", "A2", "B1", "B2"))
    assert len({passage["slug"] for passage in passages}) == len(passages)

    for passage in passages:
        assert passage["title_en"].strip()
        assert passage["summary_uz"].strip()
        assert len(passage["body_en"].split()) >= 60
        assert 3 <= len(passage["questions"]) <= 20

        for question in passage["questions"]:
            assert question["prompt_en"].strip()
            assert len(question["options"]) == 4
            assert len(set(question["options"])) == 4
            assert 0 <= question["answer_index"] < len(question["options"])
