"""Independent semantic QA pass over the corpus: does translation_uz actually
mean what headword/definition_en say it means?

Why this exists: the enrich.py pipeline's automated checks (transliteration,
repeated variants, odd characters) catch FORMATTING problems, not MEANING
problems. A translation can be grammatically clean Uzbek and still be flat
wrong — e.g. "whisper" mistranslated as "shovqin" (noise/loudness, the
opposite meaning). Catching that requires a second, independent judgment
call per word, not a regex.

Method: batch rows (headword, pos, definition_en, translation_uz) to the AI
and ask it to judge each one strict/pass-fail against the English definition,
with a corrected translation when it fails. Flagged rows are written to a
report for review; nothing is auto-applied to the source CSVs by this script
(see apply_fixes.py workflow in the corpus-pipeline memory).

Usage (from apps/api):
  .venv/bin/python -m scripts.verify_translations --files useful_batch1.csv useful_batch2.csv
  .venv/bin/python -m scripts.verify_translations --all-pipeline   # all useful_batch*.csv
  .venv/bin/python -m scripts.verify_translations --all            # every corpus CSV
"""
import argparse
import asyncio
import csv
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.services.ai_client import AiError, get_ai_client  # noqa: E402

DATA_DIR = pathlib.Path(__file__).parent / "data"
BATCH_SIZE = 15  # smaller → more reliable JSON from gemini-flash on the verdict array

_SCHEMA = {
    "type": "object",
    "properties": {
        "verdicts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "headword": {"type": "string"},
                    "ok": {"type": "boolean"},
                    "issue": {"type": "string"},
                    "suggested_uz": {"type": "string"},
                },
                "required": ["headword", "ok", "issue", "suggested_uz"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["verdicts"],
    "additionalProperties": False,
}

_SYSTEM = (
    "You are a strict bilingual reviewer fact-checking an English-Uzbek dictionary before "
    "production launch. For each word you receive its English definition and its proposed "
    "Uzbek translation.\n\n"
    "IMPORTANT FORMAT RULE: translation_uz deliberately holds ONE OR TWO synonym variants "
    "separated by a SINGLE SPACE, with no commas or punctuation (commas would break the CSV "
    "storage). For example 'kompaniya firma' means the two synonyms 'kompaniya' and 'firma', "
    "and 'shaxsiy hayot daxlsizligi' is ONE multi-word phrase. This space-separated format is "
    "CORRECT and must NEVER be flagged as an error. Do not suggest adding commas, semicolons, "
    "or other punctuation.\n\n"
    "Judge ok=true if the Uzbek conveys the SAME core meaning as the English definition and a "
    "fluent Uzbek speaker would accept it. Judge ok=false ONLY for genuine MEANING problems: a "
    "wrong meaning, an opposite meaning (e.g. 'whisper' rendered as 'shovqin'/noise), the wrong "
    "sense of the word, a transliteration of the English word instead of a real translation, or "
    "Uzbek that is genuinely broken/nonsensical. A merely imperfect-but-acceptable synonym, an "
    "extra valid variant, or the space-separated format are NOT reasons to fail. When ok=false, "
    "'issue' is one short sentence naming the meaning problem, and 'suggested_uz' is the correct "
    "natural Uzbek translation in the SAME space-separated format (Latin script, no Cyrillic, no "
    "commas). When ok=true, 'issue' and 'suggested_uz' are empty strings."
)


def load_rows(filename: str) -> list:
    path = DATA_DIR / filename
    rows = list(csv.DictReader(path.open(encoding="utf-8")))
    if not rows or "translation_uz" not in rows[0]:
        return []
    return rows


async def verify_batch(rows: list, attempts: int = 5) -> list:
    client = get_ai_client()
    if client is None:
        raise SystemExit("AI is not configured (no keys in .env)")
    items = [
        {
            "headword": r["headword"],
            "pos": r["pos"],
            "definition_en": r["definition_en"],
            "translation_uz": r["translation_uz"],
        }
        for r in rows
    ]
    prompt = "Fact-check these dictionary entries:\n" + json.dumps(items, ensure_ascii=False)
    last: Exception = AiError("no attempts made")
    for attempt in range(attempts):
        try:
            data = await client.json(
                system=_SYSTEM, prompt=prompt, schema=_SCHEMA, max_tokens=4096
            )
            return data.get("verdicts", [])
        except (AiError, ValueError) as exc:
            last = exc
            wait = 20 * (attempt + 1)
            print(f"    attempt {attempt + 1} failed ({str(exc)[:80]}); retry in {wait}s")
            await asyncio.sleep(wait)
    print(f"    giving up on this sub-batch: {last}")
    return []


async def verify_file(filename: str) -> dict:
    rows = load_rows(filename)
    if not rows:
        print(f"{filename}: skipped (no translation_uz column)")
        return {"file": filename, "total": 0, "flagged": []}
    print(f"{filename}: {len(rows)} rows")
    flagged = []
    by_headword = {r["headword"]: r for r in rows}
    for i in range(0, len(rows), BATCH_SIZE):
        chunk = rows[i : i + BATCH_SIZE]
        verdicts = await verify_batch(chunk)
        bad = [v for v in verdicts if not v.get("ok", True)]
        for v in bad:
            src = by_headword.get(v["headword"])
            flagged.append(
                {
                    "file": filename,
                    "headword": v["headword"],
                    "pos": src["pos"] if src else "",
                    "current_uz": src["translation_uz"] if src else "",
                    "issue": v.get("issue", ""),
                    "suggested_uz": v.get("suggested_uz", ""),
                }
            )
        done = min(i + BATCH_SIZE, len(rows))
        print(f"  {done}/{len(rows)} checked, {len(flagged)} flagged so far")
        await asyncio.sleep(3)  # stay under the free tier's per-minute cap
    return {"file": filename, "total": len(rows), "flagged": flagged}


async def run(files: list, out: str) -> None:
    all_flagged = []
    total_checked = 0
    for filename in files:
        result = await verify_file(filename)
        total_checked += result["total"]
        all_flagged.extend(result["flagged"])
        # Write incrementally so a long run's progress survives interruption.
        (DATA_DIR / out).write_text(
            json.dumps(all_flagged, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(f"\nchecked {total_checked} words across {len(files)} files")
    print(f"flagged {len(all_flagged)} -> {DATA_DIR / out}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--files", nargs="*", default=None)
    parser.add_argument("--all-pipeline", action="store_true", help="all useful_batch*.csv")
    parser.add_argument("--all", action="store_true", help="every corpus CSV with translations")
    parser.add_argument("--out", default="verify_report.json")
    args = parser.parse_args()

    if args.all:
        files = sorted(p.name for p in DATA_DIR.glob("*.csv") if p.name != "word_images.csv")
    elif args.all_pipeline:
        files = sorted(p.name for p in DATA_DIR.glob("useful_batch*.csv"))
    elif args.files:
        files = args.files
    else:
        raise SystemExit("pass --files, --all-pipeline, or --all")

    asyncio.run(run(files, args.out))


if __name__ == "__main__":
    main()
