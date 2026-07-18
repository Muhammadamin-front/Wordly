"""Premium English Expression Library generator for Wordly.

Produces natural, high-frequency English expressions (opinion phrases, linking
words, IELTS Speaking/Writing expressions, academic connectors, etc.) with a
rich 14-field schema, for Uzbek learners aiming at IELTS Band 7-9.

Runs on BazaarLink (deepseek-v3.2) rather than the Gemini corpus chain: the
content is English-heavy (only one Uzbek field), where the open models are
strong, and BazaarLink has no per-minute throttle — so this never competes
with the word-corpus pipeline's Gemini quota.

Output: JSONL, one expression per line, production-ready for DB import.
Dedup is by normalized expression text across all existing JSONL in the
output dir, so re-runs and multiple category passes never duplicate.

Usage (from apps/api):
  .venv/bin/python -m scripts.gen_expressions --category "Giving Opinions" --count 40
  .venv/bin/python -m scripts.gen_expressions --pilot          # ~48 across key categories
  .venv/bin/python -m scripts.gen_expressions --auto --target 5000   # full run
"""
import argparse
import asyncio
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.services.ai_client import AiError, BazaarLinkClient  # noqa: E402

OUT_DIR = pathlib.Path(__file__).parent / "data" / "expressions"
MODEL = "deepseek-v3.2"
GEN_BATCH = 5  # rich 14-field schema → small batches keep the JSON response intact
CYRILLIC = re.compile("[а-яА-ЯёЁ]")
CEFR_VALUES = {"A2", "B1", "B2", "C1", "C2"}

# Target CEFR mix per the brief: 15% A2, 20% B1, 35% B2, 20% C1, 10% C2.
CEFR_WEIGHTS = [("A2", 15), ("B1", 20), ("B2", 35), ("C1", 20), ("C2", 10)]

# The category plan. Priority categories from the brief get the largest shares.
CATEGORIES = [
    "Giving Opinions", "Agreeing", "Disagreeing", "Clarifying", "Comparing",
    "Contrasting", "Giving Examples", "Cause and Effect", "Speculating",
    "Making Suggestions", "Persuading", "Discussing Advantages",
    "Discussing Disadvantages", "Time Fillers", "Conversation Fillers",
    "Formal Expressions", "Informal Expressions", "Business English",
    "Academic English", "Debate", "Storytelling", "Travel", "Work",
    "Education", "Technology", "Environment", "Relationships", "Emotions",
    "Daily Conversation", "Linking Words", "Academic Connectors",
    "IELTS Speaking Expressions", "Probability", "Recommendation",
    "High-scoring IELTS vocabulary", "Native Speaker Alternatives to Basic English",
]

REQUIRED_STR = [
    "expression", "uzbek", "cefr", "ielts_band", "category", "formality",
    "usage", "grammar_pattern", "native_notes",
]
REQUIRED_LIST = [
    "common_mistakes", "alternatives", "example_sentences", "collocations",
    "synonyms", "opposites",
]

_SCHEMA = {
    "type": "object",
    "properties": {
        "expressions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string"},
                    "uzbek": {"type": "string"},
                    "cefr": {"type": "string", "enum": sorted(CEFR_VALUES)},
                    "ielts_band": {"type": "string"},
                    "category": {"type": "string"},
                    "formality": {"type": "string", "enum": ["Formal", "Neutral", "Informal"]},
                    "usage": {"type": "string"},
                    "grammar_pattern": {"type": "string"},
                    "common_mistakes": {"type": "array", "items": {"type": "string"}},
                    "alternatives": {"type": "array", "items": {"type": "string"}},
                    "example_sentences": {"type": "array", "items": {"type": "string"}},
                    "collocations": {"type": "array", "items": {"type": "string"}},
                    "synonyms": {"type": "array", "items": {"type": "string"}},
                    "opposites": {"type": "array", "items": {"type": "string"}},
                    "native_notes": {"type": "string"},
                },
                "required": [
                    "expression", "uzbek", "cefr", "ielts_band", "category",
                    "formality", "usage", "grammar_pattern", "common_mistakes",
                    "alternatives", "example_sentences", "collocations",
                    "synonyms", "opposites", "native_notes",
                ],
                "additionalProperties": False,
            },
        }
    },
    "required": ["expressions"],
    "additionalProperties": False,
}

_SYSTEM = (
    "You are an experienced IELTS instructor, native-level British English editor, and CEFR "
    "curriculum designer building a PREMIUM English Expression Library for the app Wordly, "
    "which helps Uzbek learners reach IELTS Band 7-9.\n\n"
    "Generate natural, high-frequency expressions that native speakers ACTUALLY use in "
    "conversation, IELTS Speaking, IELTS Writing, university discussions, business, and "
    "everyday life. Avoid textbook English, outdated phrases, and robotic examples. Prefer "
    "modern British English. Every expression should immediately make a learner sound more "
    "fluent and natural.\n\n"
    "Do NOT produce bland words like 'very good', 'very bad', 'I think', 'good', 'bad', 'nice', "
    "'big', 'small', 'happy', 'sad' as the expression itself — only reference them when teaching "
    "a better alternative.\n\n"
    "Per expression, fill EVERY field:\n"
    "- expression: the phrase (e.g. 'From my perspective')\n"
    "- uzbek: clear, natural Uzbek translation in LATIN script only (never Cyrillic)\n"
    "- cefr: one of A2/B1/B2/C1/C2 (real-world difficulty)\n"
    "- ielts_band: approximate band as a string, 5.5-9.0\n"
    "- category: the requested category\n"
    "- formality: exactly Formal, Neutral, or Informal\n"
    "- usage: 1-2 sentences on WHEN native speakers use it\n"
    "- grammar_pattern: e.g. 'From my perspective, + clause' or 'It is worth + noun/V-ing'\n"
    "- common_mistakes: 1-3 real learner mistakes\n"
    "- alternatives: 3-6 natural alternative phrasings\n"
    "- example_sentences: EXACTLY 5 realistic IELTS/real-life sentences that sound like actual "
    "conversation, not generic filler\n"
    "- collocations: 5-10 common collocations\n"
    "- synonyms: 2-5 synonyms\n"
    "- opposites: 0-3 opposite expressions (empty array if none)\n"
    "- native_notes: subtle differences from similar expressions (e.g. meanwhile vs while vs "
    "however vs nevertheless)\n\n"
    "Reply with STRICT JSON only, no prose."
)


def _norm(expr: str) -> str:
    return re.sub(r"[^a-z ]", "", expr.lower()).strip()


def existing_expressions() -> set:
    seen = set()
    if not OUT_DIR.exists():
        return seen
    for path in OUT_DIR.glob("*.jsonl"):
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                seen.add(_norm(json.loads(line)["expression"]))
            except (ValueError, KeyError):
                continue
    return seen


async def gen_batch(category: str, cefr_hint: str, avoid: list, attempts: int = 5) -> list:
    client = BazaarLinkClient()
    client._model = MODEL
    avoid_note = ""
    if avoid:
        avoid_note = (
            "\n\nDo NOT repeat any of these already-created expressions: "
            + ", ".join(sorted(avoid)[:80])
        )
    prompt = (
        f"Generate {GEN_BATCH} DISTINCT expressions in category \"{category}\". "
        f"Skew difficulty toward {cefr_hint} but vary naturally. Remember: exactly 5 "
        f"example_sentences each, and fill every field.{avoid_note}"
    )
    last: Exception = AiError("no attempts")
    for attempt in range(attempts):
        try:
            data = await client.json(
                system=_SYSTEM, prompt=prompt, schema=_SCHEMA, max_tokens=8192
            )
            return data.get("expressions", [])
        except (AiError, ValueError) as exc:
            last = exc
            wait = 8 * (attempt + 1)
            print(f"    attempt {attempt + 1} failed ({str(exc)[:70]}); retry in {wait}s")
            await asyncio.sleep(wait)
    print(f"    giving up on this sub-batch: {last}")
    return []


def valid(e: dict) -> tuple:
    """Return (ok, reason). Quarantine rather than crash the batch."""
    for f in REQUIRED_STR:
        if not isinstance(e.get(f), str) or not e[f].strip():
            return False, f"empty {f}"
    for f in REQUIRED_LIST:
        if not isinstance(e.get(f), list):
            return False, f"{f} not a list"
    if e["cefr"] not in CEFR_VALUES:
        return False, f"bad cefr {e['cefr']}"
    if e["formality"] not in ("Formal", "Neutral", "Informal"):
        return False, f"bad formality {e['formality']}"
    if CYRILLIC.search(e["uzbek"]):
        return False, "Cyrillic in uzbek"
    if len(e["example_sentences"]) < 3:
        return False, "fewer than 3 examples"
    if len(e["collocations"]) < 3:
        return False, "fewer than 3 collocations"
    return True, ""


async def generate(category: str, count: int, cefr_hint: str, seen: set, out_path: pathlib.Path) -> int:
    kept = 0
    with out_path.open("a", encoding="utf-8") as fh:
        while kept < count:
            batch = await gen_batch(category, cefr_hint, avoid=[])
            if not batch:
                break
            new_in_batch = 0
            for e in batch:
                key = _norm(str(e.get("expression", "")))
                if not key or key in seen:
                    continue
                ok, reason = valid(e)
                if not ok:
                    print(f"    REJECTED '{e.get('expression','?')}': {reason}")
                    continue
                seen.add(key)
                e["example_sentences"] = e["example_sentences"][:5]
                fh.write(json.dumps(e, ensure_ascii=False) + "\n")
                fh.flush()
                kept += 1
                new_in_batch += 1
                if kept >= count:
                    break
            print(f"  [{category}] {kept}/{count} kept (+{new_in_batch} this batch)")
            if new_in_batch == 0:  # model looping on dupes → stop this category
                break
            await asyncio.sleep(1)
    return kept


def _cefr_for(index: int) -> str:
    """Cycle a CEFR hint following the target distribution weights."""
    ladder = []
    for level, weight in CEFR_WEIGHTS:
        ladder.extend([level] * weight)
    return ladder[index % len(ladder)]


async def run(args) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seen = existing_expressions()
    print(f"already have {len(seen)} expressions on disk")

    if args.pilot:
        plan = [
            ("Giving Opinions", 8, "B2"), ("Linking Words", 8, "B2"),
            ("IELTS Speaking Expressions", 8, "C1"), ("Agreeing", 6, "B1"),
            ("Disagreeing", 6, "B1"), ("Cause and Effect", 6, "B2"),
            ("Academic Connectors", 6, "C1"),
        ]
    elif args.category:
        plan = [(args.category, args.count, args.cefr or "B2")]
    elif args.auto:
        per = max(10, args.target // len(CATEGORIES))
        plan = [(cat, per, _cefr_for(i)) for i, cat in enumerate(CATEGORIES)]
    else:
        raise SystemExit("pass --pilot, --category, or --auto")

    total = 0
    for i, (category, count, cefr_hint) in enumerate(plan):
        slug = re.sub(r"[^a-z0-9]+", "_", category.lower()).strip("_")
        out_path = OUT_DIR / f"{slug}.jsonl"
        print(f"\n=== {category} (target {count}, skew {cefr_hint}) ===")
        total += await generate(category, count, cefr_hint, seen, out_path)
    print(f"\nDONE. kept {total} new expressions; corpus now {len(seen)} total in {OUT_DIR}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--category", default=None)
    parser.add_argument("--count", type=int, default=40)
    parser.add_argument("--cefr", default=None)
    parser.add_argument("--pilot", action="store_true")
    parser.add_argument("--auto", action="store_true")
    parser.add_argument("--target", type=int, default=5000)
    asyncio.run(run(parser.parse_args()))


if __name__ == "__main__":
    main()
