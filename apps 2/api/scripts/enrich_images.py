"""Attach a representative image to corpus words via Serper (Google Images).

Usage (from apps/api, respects DATABASE_URL and SERPER_API_KEY):

    .venv/bin/python -m scripts.enrich_images --level A1 --level A2 [--limit 50]
    .venv/bin/python -m scripts.enrich_images --category ielts

Idempotent: only touches published words whose image_url is empty, so re-runs
cost zero credits for already-enriched words. Stores the Google thumbnail URL
(encrypted-tbn*.gstatic.com) — small, stable, hotlink-friendly. Each word
costs one Serper credit; the free tier has 2500.
"""
import argparse
import asyncio
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
        words = list((await db.scalars(query)).unique())
        print("{} words to enrich".format(len(words)))

        done = failed = 0
        async with httpx.AsyncClient(timeout=20.0) as client:
            for i, word in enumerate(words, start=1):
                thumb = await fetch_image(client, settings.SERPER_API_KEY, word.headword)
                if thumb:
                    word.image_url = thumb
                    done += 1
                else:
                    failed += 1
                if i % 20 == 0:
                    await db.commit()
                    print("  {}/{} (ok {}, failed {})".format(i, len(words), done, failed))
        await db.commit()
        print("done: {} enriched, {} failed".format(done, failed))


if __name__ == "__main__":
    asyncio.run(main())
