"""Seed categories and the A1 + A2 starter corpus.

Usage:  .venv/bin/python -m scripts.seed  (from apps/api, respects DATABASE_URL)

Idempotent: categories upsert by slug; words upsert by (headword, pos) via the
same CSV importer the admin panel uses. Add later CEFR levels by dropping a new
CSV in data/ and appending it to CORPUS_FILES.
"""
import asyncio
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.reading import ReadingPassage, ReadingQuestion  # noqa: E402
from app.models.vocabulary import Category  # noqa: E402
from app.services.vocabulary import import_csv  # noqa: E402

CATEGORIES = [
    # slug, en, uz, ru, emoji
    ("basics", "Basics", "Asosiy so'zlar", "Основы", "🧩"),
    ("people-family", "People & family", "Odamlar va oila", "Люди и семья", "👨‍👩‍👧"),
    ("food-drink", "Food & drink", "Ovqat va ichimlik", "Еда и напитки", "🍎"),
    ("home", "Home", "Uy", "Дом", "🏠"),
    ("school", "School", "Maktab", "Школа", "🎒"),
    ("work", "Work", "Ish", "Работа", "💼"),
    ("travel", "Travel & transport", "Sayohat va transport", "Путешествия и транспорт", "🚌"),
    ("nature", "Nature & weather", "Tabiat va ob-havo", "Природа и погода", "🌳"),
    ("animals", "Animals", "Hayvonlar", "Животные", "🐈"),
    ("body-health", "Body & health", "Tana va salomatlik", "Тело и здоровье", "🫀"),
    ("clothes", "Clothes", "Kiyimlar", "Одежда", "👕"),
    ("time", "Time", "Vaqt", "Время", "🕐"),
    ("describing", "Describing things", "Tasvirlash", "Описание", "🎨"),
    ("feelings", "Feelings", "His-tuyg'ular", "Чувства", "😊"),
    ("actions", "Common actions", "Harakatlar", "Действия", "⚡"),
    ("places", "Places in town", "Shahardagi joylar", "Места в городе", "🏙"),
    ("ielts", "IELTS Academic", "IELTS so'zlari", "Слова IELTS", "🎓"),
    ("phrasal", "Phrasal Verbs", "Frazeologik fe'llar", "Фразовые глаголы", "🔗"),
    ("idioms", "Idioms", "Idiomalar", "Идиомы", "💬"),
    ("toefl", "TOEFL", "TOEFL", "TOEFL", "🏛"),
    ("sat", "SAT", "SAT", "SAT", "✏️"),
    ("business", "Business English", "Biznes ingliz tili", "Деловой английский", "💼"),
    ("advanced", "Advanced Vocabulary", "Yuqori darajadagi so'zlar", "Продвинутая лексика", "🧠"),
]

DATA_DIR = pathlib.Path(__file__).parent / "data"
# Extra example sentences: one row per example (headword,pos,example_en,example_uz),
# appended to the word's first sense when not already present. Idempotent.
EXAMPLE_FILES = [
    "examples_a1_batch1.csv",
    "examples_a2_batch1.csv",
    "examples_a2_batch2.csv",
    "examples_b1_batch1.csv",
    "examples_all_words.csv",
    "examples_all_words_translated.csv",
    "examples_phrasal_idioms_6.csv",
    "examples_phrasal_idioms_7.csv",
    "examples_idioms_uz.csv",
]

CORPUS_FILES = [
    "a1_corpus.csv",
    "a2_corpus.csv",
    "b1_corpus.csv",
    "b2_corpus.csv",
    "categories_boost.csv",
    "ielts_top100.csv",
    "ielts_101_200.csv",
    "ielts_201_300.csv",
    "ielts_301_400.csv",
    "ielts_401_500.csv",
    "ielts_501_600.csv",
    "ielts_601_700.csv",
    "phrasal_idioms_starter.csv",
    "levels_boost2.csv",
    "phrasal_idioms_2.csv",
    "ielts_733_832.csv",
    "ielts_833_932.csv",
    "ielts_933_1000.csv",
    "ielts_1001_1050.csv",
    "phrasal_idioms_3.csv",
    "useful_batch1.csv",
    "useful_batch2.csv",
    "useful_batch3.csv",
    "phrasal_idioms_4.csv",
    "useful_batch4.csv",
    "useful_batch5.csv",
    "useful_batch6.csv",
    "useful_batch7.csv",
    "useful_batch8.csv",
    "useful_batch9.csv",
    "useful_batch10.csv",
    "useful_batch11.csv",
    "useful_batch12.csv",
    "useful_batch13.csv",
    "useful_batch14.csv",
    "phrasal_idioms_5.csv",
    "phrasal_idioms_6.csv",
    "phrasal_idioms_7.csv",
    "phrasal_idioms_8.csv",
    "reading_passage_words.csv",
    "word_families_1.csv",
    "word_families_2.csv",
    "word_families_3.csv",
    "word_families_4.csv",
    "shelf_toefl.csv",
    "shelf_sat.csv",
    "shelf_business.csv",
    "shelf_toefl_2.csv",
    "shelf_sat_2.csv",
    "shelf_business_2.csv",
    "feelings_batch1.csv",
    "feelings_batch2.csv",
    "c2_advanced_batch1.csv",
    "phrasal_idioms_9.csv",
    "idioms_expressions_batch1.csv",
    "c2_advanced_batch2.csv",
    "advanced_words_idioms_batch.csv",
    "phrasal_idioms_10.csv",
]


async def main() -> None:
    factory = get_session_factory()
    async with factory() as db:
        for sort_order, (slug, en, uz, ru, emoji) in enumerate(CATEGORIES):
            existing = await db.scalar(select(Category).where(Category.slug == slug))
            if existing is None:
                db.add(
                    Category(
                        slug=slug, name_en=en, name_uz=uz, name_ru=ru,
                        emoji=emoji, sort_order=sort_order,
                    )
                )
            else:
                existing.name_en, existing.name_uz, existing.name_ru = en, uz, ru
                existing.emoji, existing.sort_order = emoji, sort_order
        await db.commit()

        print("categories: {}".format(len(CATEGORIES)))
        total_created = total_updated = 0
        for filename in CORPUS_FILES:
            csv_text = (DATA_DIR / filename).read_text(encoding="utf-8")
            report = await import_csv(db, csv_text, default_status="published")
            await db.commit()
            total_created += report.created
            total_updated += report.updated
            print("{}: created {}, updated {}".format(filename, report.created, report.updated))
            for error in report.errors:
                print("ERROR", filename, error)
            if report.errors:
                raise SystemExit(1)
        print("total words created: {}, updated: {}".format(total_created, total_updated))

        # Extra examples — append when the sentence isn't there yet.  Re-running
        # the seed also upgrades an older example when its learner translation
        # was missing; vocabulary details must not silently lose Uzbek context.
        import csv as _csv
        from app.models.vocabulary import Word, WordExample  # noqa: E402
        ex_added = ex_updated = ex_skipped = 0
        for filename in EXAMPLE_FILES:
            path = DATA_DIR / filename
            if not path.exists():
                continue
            for row in _csv.DictReader(path.open(encoding="utf-8")):
                word = await db.scalar(
                    select(Word).where(
                        Word.headword == row["headword"], Word.pos == row["pos"]
                    )
                )
                if word is None or not word.senses:
                    ex_skipped += 1
                    continue
                sense = word.senses[0]
                example_en = row["example_en"].strip()
                existing_example = next(
                    (e for e in sense.examples if e.text_en.strip().lower() == example_en.lower()),
                    None,
                )
                if existing_example is not None:
                    changed = False
                    for field, value in (
                        ("text_uz", (row.get("example_uz") or "").strip()),
                        ("text_ru", (row.get("example_ru") or "").strip()),
                    ):
                        if value and not getattr(existing_example, field):
                            setattr(existing_example, field, value)
                            changed = True
                    if changed:
                        ex_updated += 1
                    else:
                        ex_skipped += 1
                    continue
                if not example_en:
                    ex_skipped += 1
                    continue
                sense.examples.append(
                    WordExample(
                        example_order=len(sense.examples) + 1,
                        text_en=example_en,
                        text_uz=(row.get("example_uz") or "").strip() or None,
                        text_ru=(row.get("example_ru") or "").strip() or None,
                    )
                )
                ex_added += 1
            await db.commit()
        print(
            "extra examples: added {}, translated {}, skipped {}".format(
                ex_added, ex_updated, ex_skipped
            )
        )

        # Word images (headword,pos,image_url) — set when the word has none yet,
        # so pictures survive a DB reset without re-spending Serper credits.
        img_path = DATA_DIR / "word_images.csv"
        if img_path.exists():
            img_set = 0
            for row in _csv.DictReader(img_path.open(encoding="utf-8")):
                word = await db.scalar(
                    select(Word).where(
                        Word.headword == row["headword"], Word.pos == row["pos"]
                    )
                )
                if word is not None and not word.image_url and row.get("image_url"):
                    word.image_url = row["image_url"].strip()
                    img_set += 1
            await db.commit()
            print("word images: set {}".format(img_set))

        # Reading passages — upsert by slug, questions replaced wholesale.
        passages = json.loads((DATA_DIR / "reading_passages.json").read_text(encoding="utf-8"))
        created = updated = 0
        for item in passages:
            existing = await db.scalar(
                select(ReadingPassage).where(ReadingPassage.slug == item["slug"])
            )
            if existing is None:
                existing = ReadingPassage(slug=item["slug"])
                db.add(existing)
                created += 1
            else:
                existing.questions.clear()
                updated += 1
            existing.cefr_level = item["cefr_level"]
            existing.title_en = item["title_en"]
            existing.body_en = item["body_en"]
            existing.summary_uz = item.get("summary_uz")
            for order, q in enumerate(item["questions"], start=1):
                existing.questions.append(
                    ReadingQuestion(
                        question_order=order,
                        prompt_en=q["prompt_en"],
                        options_json=json.dumps(q["options"], ensure_ascii=False),
                        answer_index=q["answer_index"],
                    )
                )
        await db.commit()
        print("reading passages: created {}, updated {}".format(created, updated))

    # Expression Library — a separate table from the word corpus above, with
    # its own idempotent importer (manages its own session). Called here too
    # so a fresh seed never leaves it empty: this step used to be a
    # manually-run script that was easy to forget after a deploy.
    from scripts import import_expressions  # noqa: E402

    await import_expressions.main()


if __name__ == "__main__":
    asyncio.run(main())
