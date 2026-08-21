"""Generate vocabulary for the exam/business shelves (TOEFL, SAT, Business).

Those three shelves shipped locked and empty. This fills them from the same
AI client the app uses, in the corpus CSV shape `scripts.seed` already
imports, so the words arrive through the normal reviewed pipeline rather than
being written straight into the database.

Every batch is checked against the words already in the corpus before it is
written — the shelves overlap heavily with the CEFR and IELTS lists, and a
naive run produces mostly duplicates.

Usage (from apps/api, needs GEMINI_API_KEY):

    python -m scripts.gen_shelf_words --category toefl --count 40
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.vocabulary import Word  # noqa: E402
from app.services.ai_client import GeminiClient  # noqa: E402

DATA_DIR = pathlib.Path(__file__).parent / "data"
FIELDNAMES = [
    "headword", "pos", "cefr_level", "translation_uz", "translation_ru",
    "definition_en", "ipa", "frequency_rank", "category",
    "example_en", "example_uz", "synonyms", "antonyms",
]
BATCH = 10
VALID_POS = {"noun", "verb", "adjective", "adverb"}
VALID_CEFR = {"A2", "B1", "B2", "C1", "C2"}

BRIEFS = {
    "toefl": (
        "academic vocabulary that appears in TOEFL iBT reading and lecture "
        "passages — the language of research, university study and academic "
        "argument"
    ),
    "sat": (
        "vocabulary tested on the SAT — precise, often formal words used in "
        "argument, analysis and literary passages"
    ),
    "business": (
        "business English used in meetings, email, negotiation, reporting and "
        "workplace conversation"
    ),
}

SYSTEM = (
    "You write vocabulary entries for an Uzbek-first English learning app.\n"
    "For each word return: the English headword, part of speech, CEFR level, "
    "a natural Uzbek translation (Latin script), a Russian translation, a "
    "one-sentence English definition, British IPA without slashes, one natural "
    "English example sentence, that sentence translated into Uzbek, up to two "
    "synonyms and up to two antonyms.\n"
    "Rules:\n"
    "1. Single words only — no phrases, no proper nouns, no abbreviations.\n"
    "2. The Uzbek must be what an Uzbek speaker would actually say, not a "
    "word-for-word gloss.\n"
    "3. The example must show the word in its typical context for this exam or "
    "register, and must contain the headword.\n"
    "4. Separate synonyms and antonyms with ' | '. Leave empty if none fit.\n"
    'Reply with JSON: {"words":[{"headword":"","pos":"","cefr":"","uz":"",'
    '"ru":"","definition":"","ipa":"","example_en":"","example_uz":"",'
    '"synonyms":"","antonyms":""}]}'
)


def clean(v) -> str:
    return " ".join(str(v or "").strip().split())


def out_path(category: str) -> pathlib.Path:
    return DATA_DIR / f"shelf_{category}.csv"


def load_written(path: pathlib.Path) -> set[str]:
    if not path.exists():
        return set()
    with path.open(encoding="utf-8", newline="") as fh:
        return {clean(r["headword"]).casefold() for r in csv.DictReader(fh)}


def append(path: pathlib.Path, rows: list[dict]) -> None:
    """Written per batch: a long run that dies must not lose what it earned."""
    is_new = not path.exists()
    with path.open("a", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=FIELDNAMES)
        if is_new:
            w.writeheader()
        w.writerows(rows)


async def existing_headwords() -> set[str]:
    factory = get_session_factory()
    async with factory() as db:
        rows = await db.scalars(select(Word.headword))
        return {h.casefold() for h in rows}


async def ask(client: GeminiClient, category: str, count: int, avoid: list[str]) -> list[dict]:
    prompt = (
        f"Give {count} distinct English words for a shelf of {BRIEFS[category]}.\n"
        f"Do NOT include any of these, which are already covered:\n"
        f"{', '.join(avoid[:400])}"
    )
    raw = (await client.text(system=SYSTEM, prompt=prompt, max_tokens=4096)).strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        return json.loads(raw).get("words", [])
    except ValueError:
        return []


class QuotaExhausted(RuntimeError):
    """The key is out of quota — every remaining batch would fail the same way."""


async def with_retry(fn, *args, attempts: int = 5):
    """Gemini answers 503 under load often enough that a multi-batch run will
    hit one; back off rather than lose the batch. A 429 is different — the
    quota is gone until it resets, so stop instead of grinding through it."""
    delay = 5.0
    for attempt in range(1, attempts + 1):
        try:
            return await fn(*args)
        except Exception as exc:  # noqa: BLE001
            text = str(exc)
            if "429" in text or "RESOURCE_EXHAUSTED" in text:
                raise QuotaExhausted(text[:160]) from exc
            if attempt == attempts:
                raise
            await asyncio.sleep(delay)
            delay *= 2
    return []


async def run(category: str, count: int) -> None:
    path = out_path(category)
    taken = await existing_headwords() | load_written(path)
    start_total = len(load_written(path))
    print(f"already written to {path.name}: {start_total}; corpus words to avoid: {len(taken)}")

    client = GeminiClient()
    written = 0
    attempts = 0
    while written < count and attempts < 12:
        attempts += 1
        want = min(BATCH, count - written)
        try:
            items = await with_retry(ask, client, category, want + 4, sorted(taken))
        except QuotaExhausted as exc:
            print(f"\nstopped: quota exhausted ({exc}).")
            print(f"{written} rows are saved in {path}; re-run after it resets and it resumes.")
            return
        except Exception as exc:  # noqa: BLE001 — one bad batch must not end the run
            print(f"  batch failed: {str(exc)[:120]}")
            continue

        rows, skipped = [], 0
        for it in items:
            head = clean(it.get("headword")).lower()
            pos = clean(it.get("pos")).lower()
            cefr = clean(it.get("cefr")).upper()
            if (
                not head
                or " " in head
                or head.casefold() in taken
                or pos not in VALID_POS
                or cefr not in VALID_CEFR
                or not clean(it.get("uz"))
                or not clean(it.get("definition"))
                or head.lower() not in clean(it.get("example_en")).lower()
            ):
                skipped += 1
                continue
            taken.add(head.casefold())
            rows.append({
                "headword": head,
                "pos": pos,
                "cefr_level": cefr,
                "translation_uz": clean(it.get("uz")),
                "translation_ru": clean(it.get("ru")),
                "definition_en": clean(it.get("definition")),
                "ipa": clean(it.get("ipa")).strip("/"),
                "frequency_rank": "",
                "category": category,
                "example_en": clean(it.get("example_en")),
                "example_uz": clean(it.get("example_uz")),
                "synonyms": clean(it.get("synonyms")),
                "antonyms": clean(it.get("antonyms")),
            })
            if len(rows) >= want:
                break

        if rows:
            append(path, rows)
            written += len(rows)
        print(f"  batch {attempts}: kept {len(rows)}, rejected {skipped} — total {written}/{count}")

    print(f"done: {written} new rows -> {path}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--category", required=True, choices=sorted(BRIEFS))
    ap.add_argument("--count", type=int, default=40)
    args = ap.parse_args()
    asyncio.run(run(args.category, args.count))


if __name__ == "__main__":
    main()
