"""Import the reviewed advanced-word and idiom batch without touching duplicates.

The normal corpus importer is an upsert because seed files are authoritative.
This one-off ingestion has a stricter contract: an existing headword is skipped
case-insensitively, even when its part of speech differs from the incoming row.

Usage (from apps/api):
    python -m scripts.import_advanced_wordlists --dry-run
    python -m scripts.import_advanced_wordlists
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import io
import json
import pathlib
import re
import sys
from collections.abc import Sequence

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import func, select  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.vocabulary import Category, Word  # noqa: E402
from app.services.vocabulary import REQUIRED_COLUMNS, import_csv  # noqa: E402


BATCH_PATH = pathlib.Path(__file__).parent / "data" / "advanced_words_idioms_batch.csv"
ALLOWED_POS = {"adjective", "adverb", "idiom", "noun", "verb"}
ALLOWED_LEVELS = {"B2", "C1", "C2"}
CATEGORY_META = {
    "advanced": ("Advanced Vocabulary", "Yuqori darajadagi so'zlar", "Продвинутая лексика", "🧠", 22),
    "idioms": ("Idioms", "Idiomalar", "Идиомы", "💬", 18),
}
CYRILLIC = re.compile(r"[\u0400-\u04ff]")


def normalise_headword(value: str) -> str:
    return " ".join(value.casefold().split())


def read_and_validate_batch() -> tuple[list[str], list[dict[str, str]]]:
    with BATCH_PATH.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = list(reader.fieldnames or [])
        rows = [{key: (value or "").strip() for key, value in row.items()} for row in reader]

    missing_columns = (REQUIRED_COLUMNS | {"category", "example_en", "example_uz"}) - set(fieldnames)
    if missing_columns:
        raise ValueError("Missing columns: {}".format(", ".join(sorted(missing_columns))))

    errors: list[str] = []
    seen: set[str] = set()
    for line_number, row in enumerate(rows, start=2):
        headword = row["headword"]
        key = normalise_headword(headword)
        missing_values = [column for column in REQUIRED_COLUMNS if not row[column]]
        if missing_values:
            errors.append(f"line {line_number}: empty {', '.join(sorted(missing_values))}")
        if not row["example_en"] or not row["example_uz"]:
            errors.append(f"line {line_number}: both learner examples are required")
        if key in seen:
            errors.append(f"line {line_number}: duplicate headword {headword!r}")
        seen.add(key)
        if row["pos"] not in ALLOWED_POS:
            errors.append(f"line {line_number}: unsupported part of speech {row['pos']!r}")
        if row["cefr_level"] not in ALLOWED_LEVELS:
            errors.append(f"line {line_number}: unsupported CEFR level {row['cefr_level']!r}")
        if row["category"] not in CATEGORY_META:
            errors.append(f"line {line_number}: unsupported category {row['category']!r}")
        if (row["category"] == "idioms") != (row["pos"] == "idiom"):
            errors.append(f"line {line_number}: idiom category and part of speech must agree")
        # Idioms often contain a movable object or possessive slot (for
        # example, "leave someone in the lurch"), so exact substring matching
        # is only a reliable invariant for single-word entries.
        if row["category"] != "idioms" and key not in normalise_headword(row["example_en"]):
            errors.append(f"line {line_number}: English example does not contain the headword")
        if CYRILLIC.search(row["translation_uz"] + row["example_uz"]):
            errors.append(f"line {line_number}: Uzbek fields contain Cyrillic characters")

    if errors:
        raise ValueError("Batch validation failed:\n" + "\n".join(errors))
    return fieldnames, rows


async def ensure_categories(db, slugs: set[str]) -> None:
    for slug in sorted(slugs):
        name_en, name_uz, name_ru, emoji, sort_order = CATEGORY_META[slug]
        category = await db.scalar(select(Category).where(Category.slug == slug))
        if category is None:
            db.add(
                Category(
                    slug=slug,
                    name_en=name_en,
                    name_uz=name_uz,
                    name_ru=name_ru,
                    emoji=emoji,
                    sort_order=sort_order,
                )
            )
        else:
            category.name_en = name_en
            category.name_uz = name_uz
            category.name_ru = name_ru
            category.emoji = emoji
            category.sort_order = sort_order
    await db.commit()


def serialise_rows(fieldnames: Sequence[str], rows: Sequence[dict[str, str]]) -> str:
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


async def run(*, dry_run: bool = False) -> dict[str, object]:
    fieldnames, rows = read_and_validate_batch()
    incoming = {normalise_headword(row["headword"]) for row in rows}

    factory = get_session_factory()
    async with factory() as db:
        existing = set(
            await db.scalars(
                select(func.lower(Word.headword)).where(func.lower(Word.headword).in_(incoming))
            )
        )
        new_rows = [row for row in rows if normalise_headword(row["headword"]) not in existing]

        summary: dict[str, object] = {
            "batch_rows": len(rows),
            "duplicates_skipped": len(rows) - len(new_rows),
            "new_rows": len(new_rows),
            "advanced": sum(row["category"] == "advanced" for row in new_rows),
            "idioms": sum(row["category"] == "idioms" for row in new_rows),
            "dry_run": dry_run,
        }
        if dry_run or not new_rows:
            return summary

        await ensure_categories(db, {row["category"] for row in new_rows})
        report = await import_csv(db, serialise_rows(fieldnames, new_rows), default_status="published")
        if report.errors:
            await db.rollback()
            raise RuntimeError("Import failed:\n" + "\n".join(report.errors))
        await db.commit()
        summary["created"] = report.created
        summary["updated"] = report.updated
        return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    print(json.dumps(asyncio.run(run(dry_run=args.dry_run)), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
