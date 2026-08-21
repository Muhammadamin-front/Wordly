"""Backfill Uzbek translations for figurative-phrase examples.

`localize_word_examples.py` deliberately refuses to touch idioms, phrasal
verbs and interjections: it uses a plain machine-translation endpoint, and a
literal rendering of "a far cry from" or "kick the bucket" teaches the wrong
meaning. That exclusion is correct, but it left ~400 idiom examples with no
Uzbek at all — the worst gap in the corpus for an Uzbek-first learner, since
a figurative English sentence is exactly what they cannot decode unaided.

This script fills that gap with the context a translator actually needs:
each request carries the phrase, its already-reviewed Uzbek meaning
(`translation_uz` on the sense) and the English definition, and asks for a
natural Uzbek sentence that conveys the MEANING rather than the words. The
existing Uzbek meaning is the anchor that makes this safe — the model is
matching an established reading, not inventing one.

Nothing is written to the database. Output goes to a delta CSV that
`scripts.seed` imports idempotently, and seed only fills a translation that
is still empty, so reviewed text is never overwritten.

Usage (from apps/api, needs GEMINI_API_KEY):

    python -m scripts.localize_idiom_examples --limit 12     # trial batch
    python -m scripts.localize_idiom_examples --all
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
from sqlalchemy.orm import selectinload  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.vocabulary import Word, WordSense  # noqa: E402
from app.services.ai_client import GeminiClient  # noqa: E402

DATA_DIR = pathlib.Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "examples_idioms_uz.csv"
FIELDNAMES = ["headword", "pos", "example_en", "example_uz"]

# The parts of speech localize_word_examples.py refuses to auto-translate.
FIGURATIVE_POS = ("idiom", "phrasal verb", "interjection")

BATCH_SIZE = 8

SYSTEM = (
    "You translate English example sentences into natural Uzbek for a "
    "vocabulary app. The sentences contain idioms and figurative phrases.\n"
    "Rules:\n"
    "1. Translate the MEANING, never word-for-word. The Uzbek must say what "
    "an English speaker understands from the sentence. Never carry an image "
    "from the English idiom into the Uzbek: phrases like 'long shot', 'far "
    "cry' or 'flying visit' have no Uzbek equivalent as an image, so render "
    "the plain meaning ('ehtimoli kam', 'butunlay boshqacha', 'qisqa "
    "tashrif') instead of inventing an odd literal phrase.\n"
    "2. You are given the phrase's established Uzbek meaning. Stay consistent "
    "with it — do not introduce a different reading.\n"
    "3. Write natural, fluent Uzbek in Latin script, exactly as an Uzbek "
    "speaker would actually say it. If a clause sounds translated or "
    "unidiomatic, rewrite it until it sounds native.\n"
    "4. Keep the register and tense of the original sentence.\n"
    "5. Do not add explanations, quotes, or the English text. Return only the "
    "translation.\n"
    'Reply with JSON: {"translations":[{"id":<int>,"uz":"<sentence>"}]} '
    "with one entry per input id, in the same order."
)


def clean(value: str | None) -> str:
    return " ".join((value or "").strip().split())


def load_done() -> set[tuple[str, str, str]]:
    """Rows this script already produced, so a re-run resumes."""
    if not OUTPUT.exists():
        return set()
    with OUTPUT.open(encoding="utf-8", newline="") as handle:
        return {
            (
                clean(row["headword"]).casefold(),
                clean(row["pos"]).casefold(),
                clean(row["example_en"]).casefold(),
            )
            for row in csv.DictReader(handle)
        }


def append_rows(rows: list[dict[str, str]]) -> None:
    """Append per batch rather than once at the end: a long run that dies
    partway through must not throw away everything before it."""
    is_new = not OUTPUT.exists()
    with OUTPUT.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        if is_new:
            writer.writeheader()
        writer.writerows(rows)


async def collect_pending(limit: int | None) -> list[dict[str, str]]:
    factory = get_session_factory()
    done = load_done()
    pending: list[dict[str, str]] = []
    async with factory() as db:
        query = (
            select(Word)
            .where(Word.status == "published", Word.pos.in_(FIGURATIVE_POS))
            .options(selectinload(Word.senses).selectinload(WordSense.examples))
            .order_by(Word.headword)
        )
        for word in (await db.scalars(query)).unique().all():
            for sense in word.senses:
                meaning = clean(sense.translation_uz)
                if not meaning:
                    # Without a reviewed Uzbek meaning there is no anchor, and
                    # guessing the reading is the exact failure to avoid.
                    continue
                for example in sense.examples:
                    text_en = clean(example.text_en)
                    if not text_en or clean(example.text_uz):
                        continue
                    key = (word.headword.casefold(), word.pos.casefold(), text_en.casefold())
                    if key in done:
                        continue
                    done.add(key)
                    pending.append(
                        {
                            "headword": word.headword,
                            "pos": word.pos,
                            "example_en": text_en,
                            "meaning_uz": meaning,
                            "definition_en": clean(sense.definition_en),
                        }
                    )
                    if limit and len(pending) >= limit:
                        return pending
    return pending


async def translate_batch(client: GeminiClient, batch: list[dict[str, str]]) -> dict[int, str]:
    payload = [
        {
            "id": i,
            "phrase": item["headword"],
            "phrase_meaning_uz": item["meaning_uz"],
            "definition_en": item["definition_en"],
            "sentence_en": item["example_en"],
        }
        for i, item in enumerate(batch)
    ]
    raw = await client.text(
        system=SYSTEM,
        prompt=json.dumps(payload, ensure_ascii=False),
        max_tokens=2048,
    )
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        data = json.loads(text)
    except ValueError:
        return {}
    out: dict[int, str] = {}
    for entry in data.get("translations", []):
        try:
            idx = int(entry["id"])
        except (KeyError, TypeError, ValueError):
            continue
        if not 0 <= idx < len(batch):
            continue
        uz = clean(entry.get("uz"))
        if not uz:
            continue
        # A "translation" that just echoes the English is a failed one.
        if uz.casefold() == clean(batch[idx]["example_en"]).casefold():
            continue
        out[idx] = uz
    return out


class QuotaExhausted(RuntimeError):
    """The API key is out of quota — every remaining batch would fail too."""


async def with_retry(fn, *args, attempts: int = 5):
    """Gemini returns a transient 503 under load often enough that a run over
    hundreds of examples will hit one. Back off rather than lose the batch.

    A 429 is different: the quota is gone until it resets, so retrying only
    burns minutes before failing anyway. Stop the whole run instead.
    """
    delay = 4.0
    for attempt in range(1, attempts + 1):
        try:
            return await fn(*args)
        except Exception as exc:  # noqa: BLE001 - retry any provider-side hiccup
            if "429" in str(exc) or "RESOURCE_EXHAUSTED" in str(exc):
                raise QuotaExhausted(str(exc)[:200]) from exc
            if attempt == attempts:
                raise
            await asyncio.sleep(delay)
            delay *= 2
    return {}


async def run(limit: int | None) -> None:
    pending = await collect_pending(limit)
    print(f"pending examples: {len(pending)}")
    if not pending:
        return

    client = GeminiClient()
    written = failed = 0
    for start in range(0, len(pending), BATCH_SIZE):
        batch = pending[start : start + BATCH_SIZE]
        try:
            results = await with_retry(translate_batch, client, batch)
        except QuotaExhausted as exc:
            print(f"\nstopped: Gemini quota exhausted ({exc}).")
            print(f"{written} translations are saved in {OUTPUT}; re-run after "
                  "the quota resets and it resumes from there.")
            return
        except Exception as exc:  # noqa: BLE001 - one bad batch must not end the run
            print(f"  batch at {start} failed: {exc}")
            failed += len(batch)
            continue
        rows = [
            {
                "headword": batch[i]["headword"],
                "pos": batch[i]["pos"],
                "example_en": batch[i]["example_en"],
                "example_uz": uz,
            }
            for i, uz in sorted(results.items())
        ]
        failed += len(batch) - len(rows)
        if rows:
            append_rows(rows)
            written += len(rows)
        print(f"  {min(start + BATCH_SIZE, len(pending))}/{len(pending)} — written {written}")
    print(f"done: written {written}, no translation {failed}")
    print(f"output: {OUTPUT}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--limit", type=int, help="translate at most this many examples")
    group.add_argument("--all", action="store_true", help="translate everything pending")
    args = parser.parse_args()
    asyncio.run(run(None if args.all else args.limit))


if __name__ == "__main__":
    main()
