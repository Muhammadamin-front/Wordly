"""Backfill Uzbek translations for seeded vocabulary examples.

The source corpus already guarantees three English examples per word. Older
batches, however, contain blank Uzbek translations for generated examples.
This script fixes only those blanks, keeps existing reviewed translations, and
writes a resumable CSV that `scripts.seed` imports idempotently.

Usage (from apps/api; no API keys are required):

  .venv/bin/python -m scripts.localize_word_examples --limit 200
  .venv/bin/python -m scripts.localize_word_examples --all

Only public English learning examples are sent to Google's public translation
endpoint. No user content, account data, secrets, or paid AI provider is used.
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import pathlib
import sys
from collections import defaultdict

import httpx

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from scripts.seed import CORPUS_FILES, EXAMPLE_FILES  # noqa: E402

DATA_DIR = pathlib.Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "examples_all_words_translated.csv"
BATCH_SIZE = 8
TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
AUTO_TRANSLATION_EXCLUDED_HEADWORDS = {"cheers"}


def clean(value: str) -> str:
    return " ".join((value or "").strip().split())


def is_teaching_note(sentence: str) -> bool:
    """Exclude generated meta copy; it is not a learner-facing example."""
    lowered = sentence.casefold()
    return (
        (lowered.startswith('"') and '" means ' in lowered)
        or lowered.startswith("in this lesson,")
    )


def corpus() -> dict[tuple[str, str], dict[str, str]]:
    rows: dict[tuple[str, str], dict[str, str]] = {}
    for filename in CORPUS_FILES:
        with (DATA_DIR / filename).open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle):
                rows[(row["headword"].casefold().strip(), row["pos"].casefold().strip())] = row
    return rows


def examples(words: dict[tuple[str, str], dict[str, str]]) -> list[dict[str, str]]:
    # Existing translations always win; output only missing translations from the
    # seed and extra-example files. A key includes sentence text to avoid duplicates.
    seen: dict[tuple[str, str, str], dict[str, str]] = {}
    for key, word in words.items():
        sentence = clean(word.get("example_en", ""))
        if sentence and not is_teaching_note(sentence):
            seen[(key[0], key[1], sentence.casefold())] = {
                "headword": word["headword"],
                "pos": word["pos"],
                "definition_en": word["definition_en"],
                "example_en": sentence,
                "example_uz": clean(word.get("example_uz", "")),
            }
    for filename in EXAMPLE_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        with path.open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle):
                key = (clean(row.get("headword", "")).casefold(), clean(row.get("pos", "")).casefold())
                sentence = clean(row.get("example_en", ""))
                if key not in words or not sentence or is_teaching_note(sentence):
                    continue
                item_key = (key[0], key[1], sentence.casefold())
                current = seen.get(item_key)
                candidate = clean(row.get("example_uz", ""))
                if current is None:
                    word = words[key]
                    seen[item_key] = {
                        "headword": word["headword"],
                        "pos": word["pos"],
                        "definition_en": word["definition_en"],
                        "example_en": sentence,
                        "example_uz": candidate,
                    }
                elif candidate and not current["example_uz"]:
                    current["example_uz"] = candidate
    # Figurative phrases need an editor or a context-aware model. A literal
    # machine translation can teach the wrong meaning, so never auto-fill them.
    return [
        item
        for item in seen.values()
        if (
            not item["example_uz"]
            and item["pos"].casefold() not in {"idiom", "phrasal verb", "interjection"}
            and item["headword"].casefold() not in AUTO_TRANSLATION_EXCLUDED_HEADWORDS
        )
    ]


def load_completed() -> dict[tuple[str, str, str], str]:
    if not OUTPUT.exists():
        return {}
    completed = {}
    with OUTPUT.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            value = clean(row.get("example_uz", ""))
            if value:
                completed[(row["headword"].casefold(), row["pos"].casefold(), clean(row["example_en"]).casefold())] = value
    return completed


async def translate_sentence(client: httpx.AsyncClient, sentence: str) -> str:
    """Translate one public learning sentence without a key or paid provider."""
    params = {"client": "gtx", "sl": "en", "tl": "uz", "dt": "t", "q": sentence}
    for attempt in range(3):
        try:
            response = await client.get(TRANSLATE_URL, params=params, timeout=20.0)
            response.raise_for_status()
            payload = response.json()
            translated = "".join(part[0] for part in payload[0] if part and part[0])
            if clean(translated):
                return clean(translated)
        except (httpx.HTTPError, IndexError, TypeError, ValueError):
            if attempt == 2:
                return ""
            await asyncio.sleep(1.5 * (attempt + 1))
    return ""


async def translate_batch(items: list[dict[str, str]], client: httpx.AsyncClient) -> dict[int, str]:
    translations = await asyncio.gather(
        *(translate_sentence(client, item["example_en"]) for item in items)
    )
    return {index: value for index, value in enumerate(translations) if value}


def write_rows(rows: list[dict[str, str]]) -> None:
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=["headword", "pos", "example_en", "example_uz", "example_ru"]
        )
        writer.writeheader()
        writer.writerows(rows)


async def run(limit: int | None) -> None:
    words = corpus()
    pending = examples(words)
    complete = load_completed()
    complete = {
        key: value
        for key, value in complete.items()
        if words.get((key[0], key[1]), {}).get("pos", "").casefold()
        not in {"idiom", "phrasal verb", "interjection"}
        and key[0] not in AUTO_TRANSLATION_EXCLUDED_HEADWORDS
    }
    pending = [
        row
        for row in pending
        if (row["headword"].casefold(), row["pos"].casefold(), row["example_en"].casefold()) not in complete
    ]
    if limit is not None:
        pending = pending[:limit]
    output = [
        {
            "headword": headword,
            "pos": pos,
            "example_en": example_en,
            "example_uz": example_uz,
            "example_ru": "",
        }
        for (headword, pos, example_en), example_uz in complete.items()
    ]
    print(f"missing Uzbek example translations: {len(pending)}")
    async with httpx.AsyncClient(headers={"User-Agent": "Vocora-content/1.0"}) as client:
        for start in range(0, len(pending), BATCH_SIZE):
            batch = pending[start : start + BATCH_SIZE]
            translated = await translate_batch(batch, client)
            for index, item in enumerate(batch):
                value = translated.get(index)
                if not value:
                    continue
                output.append(
                    {
                        "headword": item["headword"],
                        "pos": item["pos"],
                        "example_en": item["example_en"],
                        "example_uz": value,
                        "example_ru": "",
                    }
                )
            write_rows(output)
            done = min(start + len(batch), len(pending))
            print(f"translated {done}/{len(pending)}; saved {len(output)} rows")
            await asyncio.sleep(1.2)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--limit", type=int, help="translate at most this many missing examples")
    group.add_argument("--all", action="store_true", help="translate every missing example")
    args = parser.parse_args()
    if args.limit is not None and args.limit < 1:
        raise SystemExit("--limit must be positive")
    asyncio.run(run(None if args.all else args.limit))


if __name__ == "__main__":
    main()
