"""Import the generated Expression Library JSONL into the expressions table.

Idempotent upsert by slug (derived from the expression text), so it can be
re-run as generation produces more. Reads every apps/api/scripts/data/
expressions/*.jsonl.

Usage:  .venv/bin/python -m scripts.import_expressions   (respects DATABASE_URL)
"""
import asyncio
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.expression import Expression  # noqa: E402

DATA_DIR = pathlib.Path(__file__).parent / "data" / "expressions"
STR_FIELDS = ["uzbek", "cefr", "ielts_band", "category", "formality", "usage",
              "grammar_pattern", "native_notes"]
LIST_FIELDS = ["common_mistakes", "alternatives", "example_sentences",
               "collocations", "synonyms", "opposites"]


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:160]


async def main() -> None:
    rows = []
    seen = set()
    for path in sorted(DATA_DIR.glob("*.jsonl")):
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
            except ValueError:
                continue
            expr = str(e.get("expression", "")).strip()
            if not expr:
                continue
            slug = slugify(expr)
            if not slug or slug in seen:
                continue
            seen.add(slug)
            rows.append((slug, expr, e))

    factory = get_session_factory()
    created = updated = 0
    async with factory() as db:
        for slug, expr, e in rows:
            existing = await db.scalar(select(Expression).where(Expression.slug == slug))
            target = existing or Expression(slug=slug, expression=expr)
            target.expression = expr
            for f in STR_FIELDS:
                setattr(target, f, str(e.get(f, "")).strip())
            for f in LIST_FIELDS:
                val = e.get(f, [])
                setattr(target, f, [str(x).strip() for x in val if str(x).strip()] if isinstance(val, list) else [])
            if existing is None:
                db.add(target)
                created += 1
            else:
                updated += 1
        await db.commit()

    print(f"expressions imported: created {created}, updated {updated} ({len(rows)} in JSONL)")


if __name__ == "__main__":
    asyncio.run(main())
