"""Attach a representative image to corpus words via Serper (Google Images).

Usage (from apps/api, respects DATABASE_URL and SERPER_API_KEY):

    .venv/bin/python -m scripts.enrich_images --level A1 --level A2 [--limit 50]
    .venv/bin/python -m scripts.enrich_images --category ielts

Idempotent: only touches published words whose image_url is empty, so re-runs
cost zero credits for already-enriched words. Stores the Google thumbnail URL
(encrypted-tbn*.gstatic.com) — small, stable, hotlink-friendly. Each word
costs one Serper credit; the free tier has 2500.

Besides writing to the DB this script is run against, results are appended to
scripts/data/word_images.csv — the same file `scripts.seed` reads to backfill
image_url without re-spending credits, and the deployable artifact: a local
run's results ship to production by committing this CSV, not by pointing the
script at a production DATABASE_URL.
"""
import argparse
import asyncio
import csv
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from typing import Optional  # noqa: E402

import httpx  # noqa: E402
from sqlalchemy import select  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.db.session import get_session_factory  # noqa: E402
from app.models.vocabulary import Category, Word  # noqa: E402

SERPER_IMAGES_URL = "https://google.serper.dev/images"
CSV_PATH = pathlib.Path(__file__).parent / "data" / "word_images.csv"


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


async def fetch_image(client: httpx.AsyncClient, api_key: str, query: str) -> Optional[str]:
    response = await client.post(
        SERPER_IMAGES_URL,
        headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
        json={"q": query, "num": 3},
    )
    if response.status_code != 200:
        print("  ! serper {} for {!r}".format(response.status_code, query))
        return None
    for image in response.json().get("images", []):
        thumb = image.get("thumbnailUrl")
        if thumb and thumb.startswith("https://"):
            return thumb
    return None


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--level", action="append", default=[], help="CEFR level (repeatable)")
    parser.add_argument("--category", default=None, help="category slug filter")
    parser.add_argument("--limit", type=int, default=1000)
    args = parser.parse_args()

    settings = get_settings()
    if not settings.SERPER_API_KEY:
        raise SystemExit("SERPER_API_KEY is not set")

    factory = get_session_factory()
    async with factory() as db:
        query = (
            select(Word)
            .where(Word.status == "published", Word.image_url.is_(None))
            .order_by(Word.frequency_rank.asc().nulls_last())
            .limit(args.limit)
        )
        if args.level:
            query = query.where(Word.cefr_level.in_(args.level))
        if args.category:
            query = query.join(Category, Word.category_id == Category.id).where(
                Category.slug == args.category
            )
        already_in_csv = load_csv_coverage()
        words = [
            w for w in (await db.scalars(query)).unique()
            if (w.headword.casefold(), w.pos.casefold()) not in already_in_csv
        ]
        print("{} words to enrich".format(len(words)))

        done = failed = 0
        new_rows: list[tuple[str, str, str]] = []
        async with httpx.AsyncClient(timeout=20.0) as client:
            for i, word in enumerate(words, start=1):
                thumb = await fetch_image(client, settings.SERPER_API_KEY, word.headword)
                if thumb:
                    word.image_url = thumb
                    new_rows.append((word.headword, word.pos, thumb))
                    done += 1
                else:
                    failed += 1
                if i % 20 == 0:
                    await db.commit()
                    if new_rows:
                        append_csv_rows(new_rows)
                        new_rows = []
                    print("  {}/{} (ok {}, failed {})".format(i, len(words), done, failed))
        await db.commit()
        if new_rows:
            append_csv_rows(new_rows)
        print("done: {} enriched, {} failed".format(done, failed))


if __name__ == "__main__":
    asyncio.run(main())
