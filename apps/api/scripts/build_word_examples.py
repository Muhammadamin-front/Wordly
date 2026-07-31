"""Build enough reviewed learning examples for every seeded word.

Natural corpus examples are preferred. Expression records already contain
several authored sentences, so those are reused first. When a regular word has
only one sentence, the remaining slots are short learner notes grounded in the
word's existing definition and Uzbek translation; no AI or user data is used.
"""
from __future__ import annotations

import csv
import json
import pathlib
import re

from scripts.seed import CORPUS_FILES, EXAMPLE_FILES

DATA_DIR = pathlib.Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "examples_all_words.csv"
TARGET_EXAMPLES = 3


def normalize(value: str) -> str:
    value = value.casefold().replace("’", "'").replace("…", "...")
    return re.sub(r"[^a-z0-9.']+", " ", value).strip()


def clean_sentence(value: str) -> str:
    return " ".join(value.strip().split())


def expression_examples() -> dict[str, list[str]]:
    examples: dict[str, list[str]] = {}
    for path in sorted((DATA_DIR / "expressions").glob("*.jsonl")):
        for line in path.read_text(encoding="utf-8").splitlines():
            item = json.loads(line)
            key = normalize(item["expression"])
            bucket = examples.setdefault(key, [])
            for sentence in item.get("example_sentences") or []:
                sentence = clean_sentence(sentence)
                if sentence and sentence.casefold() not in {value.casefold() for value in bucket}:
                    bucket.append(sentence)
    return examples


def load_words() -> dict[tuple[str, str], dict[str, str]]:
    words: dict[tuple[str, str], dict[str, str]] = {}
    for filename in CORPUS_FILES:
        with (DATA_DIR / filename).open(encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                key = (row["headword"].strip().casefold(), row["pos"].strip().casefold())
                words[key] = row
    return words


def load_existing_examples() -> dict[tuple[str, str], list[str]]:
    examples: dict[tuple[str, str], list[str]] = {}
    for filename in EXAMPLE_FILES:
        if filename == OUTPUT.name:
            continue
        path = DATA_DIR / filename
        if not path.exists():
            continue
        with path.open(encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                key = (row["headword"].strip().casefold(), row["pos"].strip().casefold())
                sentence = clean_sentence(row["example_en"])
                bucket = examples.setdefault(key, [])
                if sentence and sentence.casefold() not in {value.casefold() for value in bucket}:
                    bucket.append(sentence)
    return examples


def learner_notes(row: dict[str, str]) -> list[str]:
    headword = row["headword"].strip()
    definition = row["definition_en"].strip().rstrip(".")
    translation = row["translation_uz"].strip().rstrip(".")
    pos = row["pos"].strip()
    return [
        f'"{headword}" means {definition}.',
        f'In this lesson, "{headword}" is used as {pos} and can mean "{translation}" in Uzbek.',
    ]


def main() -> None:
    words = load_words()
    authored = expression_examples()
    existing = load_existing_examples()
    output_rows: list[dict[str, str]] = []

    for key, row in words.items():
        seen: list[str] = []
        primary = clean_sentence(row.get("example_en") or "")
        if primary:
            seen.append(primary)
        for sentence in existing.get(key, []):
            if sentence.casefold() not in {value.casefold() for value in seen}:
                seen.append(sentence)

        candidates = [
            *authored.get(normalize(row["headword"]), []),
            *learner_notes(row),
        ]
        for sentence in candidates:
            if len(seen) >= TARGET_EXAMPLES:
                break
            sentence = clean_sentence(sentence)
            if not sentence or sentence.casefold() in {value.casefold() for value in seen}:
                continue
            seen.append(sentence)
            output_rows.append(
                {
                    "headword": row["headword"].strip(),
                    "pos": row["pos"].strip(),
                    "example_en": sentence,
                    "example_uz": "",
                    "example_ru": "",
                }
            )

        if len(seen) < TARGET_EXAMPLES:
            raise RuntimeError(f"Could not build {TARGET_EXAMPLES} examples for {key!r}")

    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["headword", "pos", "example_en", "example_uz", "example_ru"],
        )
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"words covered: {len(words)}")
    print(f"additional examples: {len(output_rows)}")


if __name__ == "__main__":
    main()
