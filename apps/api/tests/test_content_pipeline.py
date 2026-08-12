import csv
from pathlib import Path

from scripts.seed import CORPUS_FILES, EXAMPLE_FILES


DATA_DIR = Path(__file__).resolve().parents[1] / "scripts" / "data"


def test_seed_corpus_has_a_large_baseline_before_the_next_expansion():
    # The 10k launch gate is raised together with the authored expansion batch.
    # Keep a meaningful floor here so a partial corpus cannot be committed.
    rows = 0
    for filename in CORPUS_FILES:
        with (DATA_DIR / filename).open(encoding="utf-8", newline="") as handle:
            rows += sum(1 for _ in csv.DictReader(handle))
    assert rows >= 9000


def test_extra_example_files_are_well_formed_and_never_erase_translations():
    for filename in EXAMPLE_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        with path.open(encoding="utf-8", newline="") as handle:
            rows = list(csv.DictReader(handle))
        assert all(row.get("headword") and row.get("pos") and row.get("example_en") for row in rows)


def test_every_corpus_word_has_an_authored_primary_example():
    for filename in CORPUS_FILES:
        with (DATA_DIR / filename).open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle):
                assert row.get("example_en", "").strip(), (filename, row.get("headword"))
                assert row.get("example_uz", "").strip(), (filename, row.get("headword"))
