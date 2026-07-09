"""Seed categories and the A1 starter corpus.

Usage:  .venv/bin/python -m scripts.seed  (from apps/api, respects DATABASE_URL)

Idempotent: categories upsert by slug; words upsert by (headword, pos) via the
same CSV importer the admin panel uses.
"""
import asyncio
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
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
]

CSV_PATH = pathlib.Path(__file__).parent / "data" / "a1_corpus.csv"


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

        report = await import_csv(db, CSV_PATH.read_text(encoding="utf-8"), default_status="published")
        await db.commit()
        print("categories: {}".format(len(CATEGORIES)))
        print("words created: {}, updated: {}".format(report.created, report.updated))
        for error in report.errors:
            print("ERROR", error)
        if report.errors:
            raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
