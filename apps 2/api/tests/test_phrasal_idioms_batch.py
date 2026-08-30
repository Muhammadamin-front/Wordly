import csv
import json
import pathlib
import re
from collections import Counter, defaultdict


DATA_DIR = pathlib.Path(__file__).parents[1] / "scripts" / "data"


def normalize(value: str) -> str:
    value = value.casefold().replace("’", "'")
    return re.sub(r"[^a-z0-9']+", " ", value).strip()


def test_batch_six_is_unique_localized_and_has_three_examples_per_entry():
    base_path = DATA_DIR / "phrasal_idioms_6.csv"
    examples_path = DATA_DIR / "examples_phrasal_idioms_6.csv"
    base = list(csv.DictReader(base_path.open(encoding="utf-8")))
    extras = list(csv.DictReader(examples_path.open(encoding="utf-8")))

    assert len(base) == 40
    assert Counter(row["category"] for row in base) == {"phrasal": 20, "idioms": 20}
    assert len({(normalize(row["headword"]), row["pos"]) for row in base}) == 40

    required_base = {
        "headword", "translation_uz", "translation_ru", "definition_en",
        "example_en", "example_uz", "example_ru",
    }
    assert all(all(row[field].strip() for field in required_base) for row in base)

    extra_counts = Counter((normalize(row["headword"]), row["pos"]) for row in extras)
    assert len(extras) == 80
    assert set(extra_counts.values()) == {2}
    assert all(
        row["example_en"].strip()
        and row["example_uz"].strip()
        and row["example_ru"].strip()
        for row in extras
    )


def test_batch_six_expression_details_match_word_cards():
    base = list(csv.DictReader((DATA_DIR / "phrasal_idioms_6.csv").open(encoding="utf-8")))
    base_by_headword = {normalize(row["headword"]): row for row in base}
    expressions = []
    for filename in ("phrasal_verbs.jsonl", "everyday_idioms.jsonl"):
        expressions.extend(
            json.loads(line)
            for line in (DATA_DIR / "expressions" / filename).read_text(encoding="utf-8").splitlines()
            if line.strip()
        )

    assert len(expressions) == 40
    assert Counter(row["category"] for row in expressions) == {
        "Phrasal Verbs": 20,
        "Everyday Idioms": 20,
    }
    assert all(len(row["example_sentences"]) == 3 for row in expressions)
    assert all(row["usage"] and row["grammar_pattern"] and row["native_notes"] for row in expressions)
    assert all(row["common_mistakes"] for row in expressions)

    grouped = defaultdict(list)
    for row in expressions:
        grouped[normalize(row["expression"])].append(row)
    assert set(grouped) == set(base_by_headword)
    for headword, rows in grouped.items():
        assert len(rows) == 1
        assert rows[0]["uzbek"] == base_by_headword[headword]["translation_uz"]
        assert rows[0]["russian"] == base_by_headword[headword]["translation_ru"]


def test_batch_seven_is_unique_localized_and_has_three_examples_per_entry():
    base = list(csv.DictReader((DATA_DIR / "phrasal_idioms_7.csv").open(encoding="utf-8")))
    extras = list(csv.DictReader((DATA_DIR / "examples_phrasal_idioms_7.csv").open(encoding="utf-8")))

    assert len(base) == 20
    assert Counter(row["category"] for row in base) == {"phrasal": 10, "idioms": 10}
    assert len({(normalize(row["headword"]), row["pos"]) for row in base}) == 20
    assert all(
        row["translation_uz"].strip()
        and row["translation_ru"].strip()
        and row["definition_en"].strip()
        and row["example_en"].strip()
        and row["example_uz"].strip()
        and row["example_ru"].strip()
        for row in base
    )

    extra_counts = Counter((normalize(row["headword"]), row["pos"]) for row in extras)
    assert len(extras) == 40
    assert set(extra_counts.values()) == {2}
    assert all(row["example_en"].strip() and row["example_uz"].strip() and row["example_ru"].strip() for row in extras)


def test_batch_seven_expression_details_match_word_cards():
    base = list(csv.DictReader((DATA_DIR / "phrasal_idioms_7.csv").open(encoding="utf-8")))
    base_by_headword = {normalize(row["headword"]): row for row in base}
    expressions = []
    for filename in ("phrasal_verbs_7.jsonl", "everyday_idioms_7.jsonl"):
        expressions.extend(
            json.loads(line)
            for line in (DATA_DIR / "expressions" / filename).read_text(encoding="utf-8").splitlines()
            if line.strip()
        )

    assert len(expressions) == 20
    assert Counter(row["category"] for row in expressions) == {"Phrasal Verbs": 10, "Everyday Idioms": 10}
    assert all(len(row["example_sentences"]) == 3 for row in expressions)
    assert all(row["usage"] and row["grammar_pattern"] and row["native_notes"] for row in expressions)
    assert all(row["common_mistakes"] for row in expressions)
    assert {normalize(row["expression"]) for row in expressions} == set(base_by_headword)
    for row in expressions:
        source = base_by_headword[normalize(row["expression"])]
        assert row["uzbek"] == source["translation_uz"]
        assert row["russian"] == source["translation_ru"]
