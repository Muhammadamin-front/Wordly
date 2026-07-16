"""Corpus growth pipeline: frequency list → dictionary APIs → AI → seed CSV.

Scales word authoring past manual batches (goal: ~10k most-useful + IELTS
words). Three layers, because no single source has everything:

1. SELECT   — next N candidates from a frequency wordlist (google-10000),
              skipping web junk and every headword already in the corpus.
2. ENRICH   — per word, fetch the free dictionary APIs for the English facts
              (IPA, pos, definitions, examples, synonyms, ru hints). Responses
              are cached in data/.enrich_cache/ so re-runs cost nothing.
              Words with no dictionary entry are dropped (great junk filter).
3. GENERATE — the app's own AI chain (Bedrock → Gemini) picks the most useful
              modern sense, grades the definition, translates uz/ru and writes
              a bilingual example — grounded in the API facts, 10 words per
              call. Uzbek dictionary coverage is ~zero, so AI owns that layer.

The output CSV matches the seed format exactly and is validated (field
completeness, Latin-only uz, rank uniqueness, corpus dedup) before writing.

Usage (from apps/api, keys read from .env):
  .venv/bin/python -m scripts.enrich --count 100 --rank-start 4710 --out pilot_100.csv
"""
import argparse
import asyncio
import csv
import io
import json
import pathlib
import re
import sys
import unicodedata

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

import httpx  # noqa: E402

from app.services.ai_client import AiError, get_ai_client  # noqa: E402
from scripts.seed import CATEGORIES  # noqa: E402

DATA_DIR = pathlib.Path(__file__).parent / "data"
CACHE_DIR = DATA_DIR / ".enrich_cache"
WORDLIST = DATA_DIR / "wordlists" / "google-10000-en.txt"

CATEGORY_SLUGS = [slug for slug, *_ in CATEGORIES]
POS_VALUES = [
    "noun", "verb", "adjective", "adverb", "preposition", "conjunction",
    "pronoun", "determiner", "interjection", "phrasal verb", "idiom",
]
CEFR_VALUES = ["A1", "A2", "B1", "B2", "C1", "C2"]

# Frequency-list entries that are web noise, not vocabulary.
JUNK = {
    "www", "http", "https", "com", "org", "net", "edu", "gov", "html", "htm",
    "php", "asp", "jpg", "gif", "png", "pdf", "url", "faq", "cgi", "xml",
    "usr", "src", "inc", "llc", "ltd", "corp", "misc", "info", "img", "pic",
    "ebay", "paypal", "yahoo", "google", "microsoft", "linux", "unix", "cnet",
    "usa", "uk", "los", "las", "san", "og", "ie", "eg", "etc", "vs", "ok",
    "click", "site", "web", "contact", "copyright", "homepage", "login",
    "username", "password", "toolbar", "browser", "spam", "blog", "wiki",
    # month/day/unit abbreviations and clipped forms the wordlist carries
    "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov",
    "dec", "mon", "tue", "thu", "fri", "sat", "min",
    "max", "int", "tel", "dev", "pst", "gmt", "usb", "tom", "lee",
    # irregular inflections the suffix heuristic can't catch
    "got", "led", "went", "gone", "done", "made", "said", "seen", "taken",
    "came", "gave", "took", "knew", "told", "felt", "kept",
}

# Grammar/function words — learners get these from grammar lessons, not
# flashcards. Includes auxiliary/irregular forms the pos filter can't catch.
FUNCTION_WORDS = {
    "the", "and", "for", "that", "this", "these", "those", "with", "from",
    "your", "his", "her", "its", "our", "their", "you", "they", "them", "she",
    "him", "who", "whom", "whose", "which", "what", "when", "where", "why",
    "how", "not", "all", "any", "some", "each", "every", "both", "few",
    "more", "most", "other", "another", "such", "only", "own", "same", "than",
    "then", "too", "very", "just", "also", "there", "here", "out", "into",
    "onto", "upon", "about", "over", "under", "again", "once", "was", "were",
    "been", "being", "are", "has", "had", "have", "having", "does", "did",
    "will", "would", "shall", "should", "can", "could", "may", "might",
    "must", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "per", "via", "yes", "non", "off", "well", "many", "much",
    "several", "either", "neither", "none", "ours", "yours", "theirs", "mine",
}


# Words the inflection heuristic would wrongly kill ('news' is not new+s).
ALLOW = {"news", "goods", "means", "series", "species", "physics", "economics"}


def _is_inflection(word: str, known: set) -> bool:
    """Plural/3sg/past/gerund of a word we already have ('books' vs 'book')."""
    if word in ALLOW:
        return False
    for suffix, strip in (("s", 1), ("es", 2), ("ed", 2), ("ing", 3), ("d", 1)):
        if word.endswith(suffix) and len(word) - strip >= 3:
            stem = word[:-strip]
            if stem in known or stem + "e" in known:
                return True
    return False

CYRILLIC = re.compile("[а-яА-ЯёЁ]")
FIELDNAMES = [
    "headword", "pos", "cefr_level", "translation_uz", "translation_ru",
    "definition_en", "ipa", "frequency_rank", "category", "example_en",
    "example_uz", "synonyms", "antonyms",
]


def corpus_headwords() -> set:
    """Every headword already in any seed CSV (lowercased)."""
    seen = set()
    for path in DATA_DIR.glob("*.csv"):
        with open(path, encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            if reader.fieldnames and "headword" in reader.fieldnames:
                for row in reader:
                    seen.add(row["headword"].strip().lower())
    return seen


def select_candidates(count: int) -> list:
    """Next `count` frequency-ordered content words not yet in the corpus."""
    existing = corpus_headwords()
    picked = []
    picked_words = set()
    for i, line in enumerate(WORDLIST.read_text(encoding="utf-8").splitlines()):
        word = line.strip().lower()
        if (
            len(word) < 3 or not word.isalpha()
            or word in JUNK or word in FUNCTION_WORDS or word in existing
            or _is_inflection(word, existing | picked_words)
        ):
            continue
        picked.append({"word": word, "freq_pos": i + 1})
        picked_words.add(word)
        if len(picked) >= count:
            break
    return picked


# --- Layer 2: dictionary APIs -------------------------------------------------
async def fetch_entry(client: httpx.AsyncClient, word: str) -> dict:
    """Cached lookup: freedictionaryapi (richer) first, dictionaryapi.dev after."""
    cache_file = CACHE_DIR / f"{word}.json"
    if cache_file.exists():
        return json.loads(cache_file.read_text(encoding="utf-8"))

    result = {"word": word, "missing": True}
    for source, url in (
        ("freedictionaryapi", f"https://freedictionaryapi.com/api/v1/entries/en/{word}?translations=true"),
        ("dictionaryapi.dev", f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"),
    ):
        for attempt in range(3):
            try:
                resp = await client.get(url, timeout=15.0)
            except httpx.HTTPError:
                await asyncio.sleep(1.5 * (attempt + 1))
                continue
            if resp.status_code == 200:
                result = {"word": word, "source": source, "data": resp.json()}
                break
            if resp.status_code == 404:
                break  # not in this dictionary; try the next source
            await asyncio.sleep(1.5 * (attempt + 1))  # rate limit / 5xx
        if not result.get("missing"):
            break

    CACHE_DIR.mkdir(exist_ok=True)
    cache_file.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    return result


def _clean_ipa(text: str) -> str:
    return (text or "").strip().strip("/")


def summarise_entry(raw: dict) -> dict:
    """Boil an API response down to the facts the AI prompt needs."""
    facts = {"word": raw["word"], "ipa": "", "pos": [], "senses": [], "ru": []}
    data = raw.get("data")
    if raw.get("source") == "freedictionaryapi":
        for entry in data.get("entries", []):
            pos = entry.get("partOfSpeech", "")
            if pos and pos not in facts["pos"]:
                facts["pos"].append(pos)
            if not facts["ipa"]:
                for pron in entry.get("pronunciations", []):
                    if pron.get("type") == "ipa" and pron.get("text"):
                        facts["ipa"] = _clean_ipa(pron["text"])
                        break
            for sense in entry.get("senses", [])[:3]:
                tags = [t.lower() for t in sense.get("tags", [])]
                if any(t in tags for t in ("archaic", "obsolete", "dated", "rare")):
                    continue
                facts["senses"].append({
                    "pos": pos,
                    "definition": sense.get("definition", ""),
                    "examples": sense.get("examples", [])[:2],
                    "synonyms": sense.get("synonyms", [])[:4],
                    "antonyms": sense.get("antonyms", [])[:2],
                })
                for tr in sense.get("translations", []):
                    if tr.get("language", {}).get("code") == "ru":
                        facts["ru"].append(tr.get("word", ""))
    elif raw.get("source") == "dictionaryapi.dev":
        for entry in data if isinstance(data, list) else []:
            for pron in entry.get("phonetics", []):
                if pron.get("text") and not facts["ipa"]:
                    facts["ipa"] = _clean_ipa(pron["text"])
            for meaning in entry.get("meanings", []):
                pos = meaning.get("partOfSpeech", "")
                if pos and pos not in facts["pos"]:
                    facts["pos"].append(pos)
                for d in meaning.get("definitions", [])[:2]:
                    facts["senses"].append({
                        "pos": pos,
                        "definition": d.get("definition", ""),
                        "examples": [d["example"]] if d.get("example") else [],
                        "synonyms": d.get("synonyms", [])[:4],
                        "antonyms": d.get("antonyms", [])[:2],
                    })
    facts["senses"] = facts["senses"][:5]
    facts["ru"] = facts["ru"][:3]
    return facts


# --- Layer 3: AI generation ---------------------------------------------------
_WORD_SCHEMA = {
    "type": "object",
    "properties": {
        "words": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "headword": {"type": "string"},
                    "pos": {"type": "string", "enum": POS_VALUES},
                    "cefr_level": {"type": "string", "enum": CEFR_VALUES},
                    "translation_uz": {"type": "string"},
                    "translation_ru": {"type": "string"},
                    "definition_en": {"type": "string"},
                    "ipa": {"type": "string"},
                    "category": {"type": "string", "enum": CATEGORY_SLUGS},
                    "example_en": {"type": "string"},
                    "example_uz": {"type": "string"},
                    "synonyms": {"type": "string"},
                    "antonyms": {"type": "string"},
                },
                "required": [
                    "headword", "pos", "cefr_level", "translation_uz",
                    "translation_ru", "definition_en", "ipa", "category",
                    "example_en", "example_uz", "synonyms", "antonyms",
                ],
                "additionalProperties": False,
            },
        }
    },
    "required": ["words"],
    "additionalProperties": False,
}

_SYSTEM = (
    "You are a bilingual lexicographer building a vocabulary app for Uzbek learners "
    "of English. For each input word you produce one dictionary entry for its single "
    "most useful modern sense (ignore archaic, technical or niche senses). Rules: "
    "definition_en is a simple graded definition of at most 18 words, understandable "
    "one CEFR level below the word itself. translation_uz is natural Uzbek in LATIN "
    "script only (never Cyrillic); give 1-2 variants separated by a space, no commas. "
    "translation_ru is natural Russian. example_en is one natural everyday sentence of "
    "8-14 words using the headword; example_uz is its natural Uzbek translation (Latin "
    "script). Copy the provided IPA when given (no slashes); otherwise supply standard "
    "British IPA. cefr_level reflects real-world difficulty. category: pick the best "
    "thematic fit from the allowed list; use 'ielts' for academic/abstract B2-C2 words "
    "that suit IELTS essays; 'basics' only for true beginner words. synonyms: at most "
    "2, space-separated, or empty string. antonyms: at most 1, or empty string."
)


async def generate_rows(facts_batch: list, attempts: int = 4) -> list:
    """One AI call per batch, retried with backoff — providers 503 under load
    and long JSON responses occasionally truncate."""
    client = get_ai_client()
    if client is None:
        raise SystemExit("AI is not configured (no keys in .env)")
    prompt = (
        "Create entries for these words. Dictionary facts for grounding (senses may "
        "include several parts of speech — choose the most useful one):\n"
        + json.dumps(facts_batch, ensure_ascii=False)
    )
    last: Exception = AiError("no attempts made")
    for attempt in range(attempts):
        try:
            data = await client.json(
                system=_SYSTEM, prompt=prompt, schema=_WORD_SCHEMA, max_tokens=8192
            )
            return data.get("words", [])
        except (AiError, ValueError) as exc:
            last = exc
            wait = 8 * (attempt + 1)
            print(f"  attempt {attempt + 1} failed ({str(exc)[:80]}); retry in {wait}s")
            await asyncio.sleep(wait)
    raise last


# --- Validation ---------------------------------------------------------------
def validate_rows(rows: list, existing: set) -> tuple:
    """Quarantine bad rows instead of failing the batch — a rejected word is
    simply re-selected next run. Returns (good_rows, warnings)."""
    good, warnings = [], []
    seen = set()
    for row in rows:
        word = row["headword"]

        def reject(reason: str) -> None:
            warnings.append(f"REJECTED {word}: {reason}")

        missing = [
            f for f in FIELDNAMES
            if f not in ("synonyms", "antonyms", "frequency_rank")
            and not str(row.get(f, "")).strip()
        ]
        if missing:
            reject(f"empty field(s) {', '.join(missing)}")
            continue
        if CYRILLIC.search(row["translation_uz"] + row["example_uz"]):
            reject("Cyrillic in uz field")
            continue
        if word.lower() in existing:
            reject("already in corpus")
            continue
        if word.lower() in seen:
            reject("duplicated in batch")
            continue
        if row["pos"] not in POS_VALUES:
            reject(f"bad pos {row['pos']}")
            continue
        if row["category"] not in CATEGORY_SLUGS:
            reject(f"bad category {row['category']}")
            continue
        seen.add(word.lower())
        good.append(row)
        if word.lower() not in row["example_en"].lower():
            warnings.append(f"{word}: headword not literally in example_en")
        if any(unicodedata.category(ch) == "Lo" for ch in row["translation_uz"]):
            warnings.append(f"{word}: unusual script in translation_uz")
    return good, warnings


# --- Pipeline -----------------------------------------------------------------
async def run(count: int, rank_start: int, out: str, batch_size: int) -> None:
    candidates = select_candidates(count)
    print(f"selected {len(candidates)} candidates "
          f"(freq positions {candidates[0]['freq_pos']}-{candidates[-1]['freq_pos']})")

    sem = asyncio.Semaphore(4)
    async with httpx.AsyncClient(headers={"User-Agent": "wordly-corpus/1.0"}) as http:
        async def bounded(cand):
            async with sem:
                return await fetch_entry(http, cand["word"])
        raw_entries = await asyncio.gather(*(bounded(c) for c in candidates))

    facts, dropped = [], []
    for cand, raw in zip(candidates, raw_entries):
        if raw.get("missing"):
            dropped.append(cand["word"])
            continue
        summary = summarise_entry(raw)
        summary["freq_pos"] = cand["freq_pos"]
        facts.append(summary)
    print(f"enriched {len(facts)} via APIs; dropped {len(dropped)} with no entry: "
          f"{', '.join(dropped) or '—'}")

    rows = []
    for i in range(0, len(facts), batch_size):
        chunk = facts[i:i + batch_size]
        try:
            generated = await generate_rows(chunk)
        except (AiError, ValueError) as exc:
            print(f"AI batch {i // batch_size + 1} failed: {exc}; skipping")
            continue
        wanted = {f["word"] for f in chunk}
        ipa_by_word = {f["word"]: f["ipa"] for f in chunk}
        for entry in generated:
            if entry["headword"].lower() not in wanted:
                continue  # hallucinated extra word
            entry["ipa"] = _clean_ipa(ipa_by_word.get(entry["headword"].lower()) or entry["ipa"])
            rows.append(entry)
        print(f"batch {i // batch_size + 1}: {len(generated)} entries "
              f"({len(rows)} total)")
        await asyncio.sleep(3)  # stay under the free tier's per-minute cap

    rows, warnings = validate_rows(rows, corpus_headwords())
    for idx, row in enumerate(rows):
        row["frequency_rank"] = rank_start + idx * 2

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=FIELDNAMES)
    writer.writeheader()
    for row in rows:
        writer.writerow({k: row.get(k, "") for k in FIELDNAMES})
    out_path = DATA_DIR / out
    out_path.write_text(buffer.getvalue(), encoding="utf-8")

    print(f"\nwrote {len(rows)} rows -> {out_path}")
    print(f"ranks {rank_start}-{rank_start + (len(rows) - 1) * 2}")
    if warnings:
        print(f"\n{len(warnings)} warnings for human review:")
        for w in warnings:
            print(" ", w)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--count", type=int, default=100)
    parser.add_argument("--rank-start", type=int, required=True)
    parser.add_argument("--out", required=True, help="output CSV name (in data/)")
    parser.add_argument("--batch-size", type=int, default=8)
    args = parser.parse_args()
    asyncio.run(run(args.count, args.rank_start, args.out, args.batch_size))


if __name__ == "__main__":
    main()
