"""Attach a representative image to corpus words via Wikimedia Commons.

Free and keyless — unlike Serper (scripts/enrich_images.py), there is no
credit budget to run out of, which matters here: Serper's free tier (2500
credits) was exhausted at 153/~7000 remaining words.

Usage (from apps/api, respects DATABASE_URL):

    .venv/bin/python -m scripts.enrich_images_wikimedia --pos noun [--limit 50]

Idempotent: only touches published words whose image_url is empty, so a
re-run only pays for what's still missing. Commons' search ranks by
relevance but isn't always right for a specific headword's sense (a search
for "carelessness" can surface an unrelated photo whose caption happens to
mention it) — a result is only accepted when the headword appears in the
image's own title, a simple but effective filter for the failure mode that
matters here: title mismatch, not aesthetic quality.

Besides writing to the DB this script is run against, results are appended
to scripts/data/word_images.csv — the same file `scripts.seed` reads to
backfill image_url without re-querying, and the deployable artifact: a
local run's results ship to production by committing this CSV, not by
pointing the script at a production DATABASE_URL.
"""
import argparse
import asyncio
import csv
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from typing import Optional  # noqa: E402

import httpx  # noqa: E402
from sqlalchemy import select  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.vocabulary import Category, Word  # noqa: E402

COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php"
CSV_PATH = pathlib.Path(__file__).parent / "data" / "word_images.csv"
USER_AGENT = "Vocora-content-enrichment/1.0 (https://vocora.uz; contact via repo)"


def load_csv_coverage() -> set[tuple[str, str]]:
    if not CSV_PATH.exists():
        return set()
    with CSV_PATH.open(encoding="utf-8", newline="") as handle:
        return {
            (row["headword"].casefold().strip(), row["pos"].casefold().strip())
            for row in csv.DictReader(handle)
        }


def append_csv_rows(rows: list[tuple[str, str, str]]) -> None:
    is_new = not CSV_PATH.exists()
    with CSV_PATH.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        if is_new:
            writer.writerow(["headword", "pos", "image_url"])
        writer.writerows(rows)


def title_matches(headword: str, title: str) -> bool:
    """The relevance guard: reject results whose title doesn't actually
    mention the headword, rather than trusting Commons' search ranking
    blindly (see module docstring — the "carelessness" failure mode)."""
    cleaned = re.sub(r"^file:", "", title, flags=re.IGNORECASE)
    cleaned = re.sub(r"\.\w+$", "", cleaned)  # drop the file extension
    return re.search(rf"\b{re.escape(headword)}\b", cleaned, flags=re.IGNORECASE) is not None


async def search_commons(client: httpx.AsyncClient, headword: str) -> Optional[str]:
    params = {
        "action": "query",
        "generator": "search",
        "gsrnamespace": "6",  # File: namespace
        "gsrsearch": f"filetype:bitmap {headword}",
        "gsrlimit": "3",
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": "400",
        "format": "json",
    }
    try:
        response = await client.get(COMMONS_API_URL, params=params, timeout=15.0)
        response.raise_for_status()
        pages = response.json().get("query", {}).get("pages", {})
    except (httpx.HTTPError, ValueError):
        return None
    for page in pages.values():
        title = page.get("title", "")
        if not title_matches(headword, title):
            continue
        info = (page.get("imageinfo") or [{}])[0]
        thumb = info.get("thumburl")
        if thumb:
            return thumb
    return None


async def run(pos_filter: Optional[str], category_filter: Optional[str], limit: Optional[int]) -> None:
    factory = get_session_factory()
    csv_coverage = load_csv_coverage()
    async with factory() as db:
        query = select(Word).where(Word.status == "published", Word.image_url.is_(None))
        if pos_filter:
            query = query.where(Word.pos == pos_filter)
        if category_filter:
            query = query.join(Category).where(Category.slug == category_filter)
        query = query.order_by(Word.frequency_rank.asc().nulls_last())
        if limit:
            query = query.limit(limit)
        candidates = (await db.scalars(query)).unique().all()

        found = skipped_csv = not_found = too_long = 0
        async with httpx.AsyncClient(headers={"User-Agent": USER_AGENT}) as client:
            for i, word in enumerate(candidates, start=1):
                key = (word.headword.casefold(), word.pos.casefold())
                if key in csv_coverage:
                    skipped_csv += 1
                    continue
                url = await search_commons(client, word.headword)
                if url and len(url) > 512:  # column limit; Commons URLs occasionally run long
                    too_long += 1
                elif url:
                    word.image_url = url
                    append_csv_rows([(word.headword, word.pos, url)])
                    found += 1
                else:
                    not_found += 1
                # Commit and persist per word rather than once at the end: a run over
                # thousands of words is exactly the kind that dies partway through
                # (network blip, a bad row), and this was originally a single
                # end-of-run commit — the first failure lost every result before it.
                await db.commit()
                if i % 100 == 0:
                    print(f"progress: {i}/{len(candidates)}")
        print(
            f"candidates: {len(candidates)}, found: {found}, "
            f"no relevant match: {not_found}, already in CSV: {skipped_csv}, "
            f"skipped (url too long): {too_long}"
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pos", help="only enrich words with this part of speech")
    parser.add_argument("--category", help="only enrich words in this category slug")
    parser.add_argument("--limit", type=int, help="cap how many words to attempt")
    args = parser.parse_args()
    asyncio.run(run(args.pos, args.category, args.limit))


if __name__ == "__main__":
    main()
