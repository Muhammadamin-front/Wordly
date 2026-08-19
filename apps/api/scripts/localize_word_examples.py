"""Backfill Uzbek and Russian translations for seeded vocabulary examples.

The source corpus already guarantees three English examples per word. Older
batches, however, contain blank Uzbek translations for generated examples,
and Russian translations were never generated at all. This script fixes
those gaps independently per language, keeps existing reviewed translations,
and writes a resumable CSV that `scripts.seed` imports idempotently.

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

import httpx

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from scripts.seed import CORPUS_FILES, EXAMPLE_FILES  # noqa: E402

DATA_DIR = pathlib.Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "examples_all_words_translated.csv"
BATCH_SIZE = 8
TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
AUTO_TRANSLATION_EXCLUDED_HEADWORDS = {"cheers"}
# Figurative phrases need an editor or a context-aware model. A literal
# machine translation can teach the wrong meaning, so never auto-fill them.
AUTO_TRANSLATION_EXCLUDED_POS = {"idiom", "phrasal verb", "interjection"}
LANGUAGES = ("uz", "ru")

ExampleKey = tuple[str, str, str]  # (headword, pos, example_en) — all casefolded


def clean(value: str) -> str:
    return " ".join((value or "").strip().split())


def is_teaching_note(sentence: str) -> bool:
    """Exclude generated meta copy; it is not a learner-facing example."""
    lowered = sentence.casefold()
    return (
        (lowered.startswith('"') and '" means ' in lowered)
        or lowered.startswith("in this lesson,")
    )


def is_auto_translatable(headword: str, pos: str) -> bool:
    return (
        pos.casefold() not in AUTO_TRANSLATION_EXCLUDED_POS
        and headword.casefold() not in AUTO_TRANSLATION_EXCLUDED_HEADWORDS
    )


def corpus() -> dict[tuple[str, str], dict[str, str]]:
    rows: dict[tuple[str, str], dict[str, str]] = {}
    for filename in CORPUS_FILES:
        with (DATA_DIR / filename).open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle):
                rows[(row["headword"].casefold().strip(), row["pos"].casefold().strip())] = row
    return rows


def examples(words: dict[tuple[str, str], dict[str, str]]) -> dict[ExampleKey, dict[str, str]]:
    """Every real (non-teaching-note) example sentence anywhere in the
    corpus, keyed by (headword, pos, example_en), carrying whatever
    translations the corpus itself already has (blank if never written —
    OUTPUT, this script's own delta file, is deliberately excluded here, so
    this reflects only what the *rest* of the corpus already covers)."""
    seen: dict[ExampleKey, dict[str, str]] = {}

    def record(word: dict[str, str], sentence: str, example_uz: str, example_ru: str = "") -> None:
        key = (word["headword"].casefold(), word["pos"].casefold(), sentence.casefold())
        current = seen.get(key)
        if current is None:
            seen[key] = {
                "headword": word["headword"],
                "pos": word["pos"],
                "example_en": sentence,
                "example_uz": example_uz,
                "example_ru": example_ru,
            }
        else:
            if example_uz and not current["example_uz"]:
                current["example_uz"] = example_uz
            if example_ru and not current["example_ru"]:
                current["example_ru"] = example_ru

    for word in words.values():
        sentence = clean(word.get("example_en", ""))
        if sentence and not is_teaching_note(sentence):
            record(word, sentence, clean(word.get("example_uz", "")))
    for filename in EXAMPLE_FILES:
        if filename == OUTPUT.name:
            continue
        path = DATA_DIR / filename
        if not path.exists():
            continue
        with path.open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle):
                key = (clean(row.get("headword", "")).casefold(), clean(row.get("pos", "")).casefold())
                sentence = clean(row.get("example_en", ""))
                if key not in words or not sentence or is_teaching_note(sentence):
                    continue
                record(
                    words[key],
                    sentence,
                    clean(row.get("example_uz", "")),
                    clean(row.get("example_ru", "")),
                )
    return seen


def load_completed() -> dict[ExampleKey, dict[str, str]]:
    """This script's own prior contributions — the delta this file owns."""
    if not OUTPUT.exists():
        return {}
    completed: dict[ExampleKey, dict[str, str]] = {}
    with OUTPUT.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            key = (row["headword"].casefold(), row["pos"].casefold(), clean(row["example_en"]).casefold())
            completed[key] = {
                "headword": row["headword"],
                "pos": row["pos"],
                "example_en": clean(row["example_en"]),
                "uz": clean(row.get("example_uz", "")),
                "ru": clean(row.get("example_ru", "")),
            }
    return completed


async def translate_sentence(client: httpx.AsyncClient, sentence: str, target: str) -> str:
    """Translate one public learning sentence without a key or paid provider."""
    params = {"client": "gtx", "sl": "en", "tl": target, "dt": "t", "q": sentence}
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


async def translate_batch(
    jobs: list[tuple[int, str]], sentences: dict[int, str], client: httpx.AsyncClient
) -> dict[int, str]:
    """jobs: list of (row_index, target_lang) still missing a translation."""
    results = await asyncio.gather(
        *(translate_sentence(client, sentences[index], target) for index, target in jobs)
    )
    return {job: value for job, value in zip(jobs, results) if value}


def write_rows(rows: dict[ExampleKey, dict[str, str]]) -> None:
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=["headword", "pos", "example_en", "example_uz", "example_ru"]
        )
        writer.writeheader()
        for (headword, pos, example_en), row in rows.items():
            writer.writerow(
                {
                    "headword": row["headword"],
                    "pos": row["pos"],
                    "example_en": row["example_en"],
                    "example_uz": row.get("uz", ""),
                    "example_ru": row.get("ru", ""),
                }
            )


async def run(limit: int | None) -> None:
    words = corpus()
    corpus_examples = examples(words)  # rest-of-corpus state, excludes OUTPUT
    output_rows = load_completed()  # this delta file's own prior contributions

    candidates = {
        key: item
        for key, item in corpus_examples.items()
        if is_auto_translatable(item["headword"], item["pos"])
    }
    pending: list[tuple[ExampleKey, str]] = []
    for key, item in candidates.items():
        owned = output_rows.get(key, {})
        for lang in LANGUAGES:
            has_it = bool(item.get(f"example_{lang}") or owned.get(lang))
            if not has_it:
                pending.append((key, lang))
    if limit is not None:
        pending = pending[:limit]

    print(
        f"missing translations to fill: {len(pending)} "
        f"({len(candidates)} auto-translatable examples, {len(LANGUAGES)} languages)"
    )
    sentences = {i: candidates[key]["example_en"] for i, (key, _lang) in enumerate(pending)}
    jobs = [(i, lang) for i, (_key, lang) in enumerate(pending)]

    def ensure_owned(key: ExampleKey) -> dict[str, str]:
        if key not in output_rows:
            headword, pos, example_en = key
            item = candidates[key]
            output_rows[key] = {
                "headword": item["headword"],
                "pos": item["pos"],
                "example_en": item["example_en"],
                "uz": "",
                "ru": "",
            }
        return output_rows[key]

    async with httpx.AsyncClient(headers={"User-Agent": "Vocora-content/1.0"}) as client:
        for start in range(0, len(jobs), BATCH_SIZE):
            batch = jobs[start : start + BATCH_SIZE]
            translated = await translate_batch(batch, sentences, client)
            for job, value in translated.items():
                index, lang = job
                key, _lang = pending[index]
                ensure_owned(key)[lang] = value
            write_rows(output_rows)
            done = min(start + len(batch), len(jobs))
            print(f"translated {done}/{len(jobs)}")
            await asyncio.sleep(1.2)

    write_rows(output_rows)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--limit", type=int, help="translate at most this many missing (example, language) pairs")
    group.add_argument("--all", action="store_true", help="translate every missing translation")
    args = parser.parse_args()
    if args.limit is not None and args.limit < 1:
        raise SystemExit("--limit must be positive")
    asyncio.run(run(None if args.all else args.limit))


if __name__ == "__main__":
    main()
