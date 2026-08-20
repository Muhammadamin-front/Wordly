"""Remove auto-generated "teaching note" rows that were imported as if they
were real example sentences.

An earlier content-generation pass produced rows like:

  "sister" means A girl or woman with the same parents as you.
  In this lesson, "sister" is used as noun and can mean "opa yoki singil" in Uzbek.

for most headwords in examples_all_words.csv. These are meta-commentary, not
usage examples, and scripts.seed's extra-examples loop had no filter for
them, so they got imported as real WordExample rows and are shown to
learners on the word detail page and in the vocabulary word modal
(both render every example a sense has, unbounded or sliced to 3).
The source CSV has since been cleaned (scripts/data/examples_all_words.csv
now contains only the ~422 genuine rows), which stops the problem from
recurring on the next seed — but scripts.seed only adds/updates rows, so it
never removes what was already imported. This script does that half.

Matches the same is_teaching_note() pattern scripts/localize_word_examples.py
already uses to exclude these from translation.

Usage (from apps/api):

  .venv/bin/python -m scripts.remove_teaching_note_examples          # dry run, reports only
  .venv/bin/python -m scripts.remove_teaching_note_examples --apply  # actually deletes
"""
from __future__ import annotations

import argparse
import asyncio
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.vocabulary import WordExample  # noqa: E402


def is_teaching_note(sentence: str) -> bool:
    lowered = (sentence or "").casefold()
    return (
        (lowered.startswith('"') and '" means ' in lowered)
        or lowered.startswith("in this lesson,")
    )


async def run(apply: bool) -> None:
    factory = get_session_factory()
    async with factory() as db:
        rows = (await db.scalars(select(WordExample))).all()
        junk = [row for row in rows if is_teaching_note(row.text_en)]
        print(f"examples scanned: {len(rows)}, matching teaching-note pattern: {len(junk)}")
        if not junk:
            return
        for row in junk[:5]:
            print("  sample:", row.text_en[:90])
        if not apply:
            print("dry run — pass --apply to delete these rows")
            return
        for row in junk:
            await db.delete(row)
        await db.commit()
        print(f"deleted {len(junk)} rows")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="actually delete; default is a dry run")
    args = parser.parse_args()
    asyncio.run(run(args.apply))


if __name__ == "__main__":
    main()
