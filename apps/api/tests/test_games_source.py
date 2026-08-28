"""Level/category game sources: play any level or the idioms/phrasal/IELTS
shelves even before adding those words as cards (get-or-create feeds SRS)."""
import app.db.session as db_session
from app.models.vocabulary import Category
from tests.conftest import register_user
from tests.test_vocabulary import WORD_PAYLOAD, make_admin


async def ensure_category(slug):
    async with db_session._session_factory() as db:
        from sqlalchemy import select
        if await db.scalar(select(Category).where(Category.slug == slug)) is None:
            db.add(Category(slug=slug, name_en=slug, name_uz=slug, name_ru=slug, emoji="X", sort_order=99))
            await db.commit()


async def seed_words(client, admin_headers, *, level, category, prefix, count=8):
    if category:
        await ensure_category(category)
    for i in range(count):
        payload = {
            **WORD_PAYLOAD,
            "headword": "{}{}".format(prefix, i),
            "cefr_level": level,
            "category_slug": category,
            "frequency_rank": 500 + i,
            "senses": [
                {
                    "definition_en": "meaning {}.".format(i),
                    "translation_uz": "tarjima {} {}".format(prefix, i),
                    "translation_ru": "perevod {} {}".format(prefix, i),
                    "examples": [{"text_en": "Use {}{} in a sentence today.".format(prefix, i)}],
                }
            ],
        }
        r = await client.post("/api/v1/admin/words", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text


async def fresh_learner(client, email="player@words.uz"):
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_play_by_level_without_owning_cards(client):
    admin = await make_admin(client)
    await seed_words(client, admin, level="B2", category=None, prefix="hard")
    headers = await fresh_learner(client)

    # A brand-new user with zero cards can still play a B2 session.
    r = await client.get("/api/v1/games/speed_quiz?level=B2&count=6", headers=headers)
    assert r.status_code == 200, r.text
    body = r.json()
    assert len(body["questions"]) >= 4

    # The played words are now in the user's cards (SRS is fed).
    queue = (await client.get("/api/v1/review/queue", headers=headers)).json()
    assert queue["new_count"] + queue["due_count"] >= 4


async def test_play_by_category_idioms(client):
    admin = await make_admin(client)
    await seed_words(client, admin, level="B1", category="idioms", prefix="idiom")
    headers = await fresh_learner(client, email="idiomfan@words.uz")

    r = await client.get("/api/v1/games/word_match?category=idioms&count=6", headers=headers)
    assert r.status_code == 200, r.text
    answers = {q["answer"] for q in r.json()["questions"]}
    # word_match answers are the uz translations we seeded for idioms.
    assert any("idiom" in a for a in answers)


async def test_level_filter_excludes_other_levels(client):
    admin = await make_admin(client)
    await seed_words(client, admin, level="C1", category=None, prefix="adv")
    await seed_words(client, admin, level="A1", category=None, prefix="easy")
    headers = await fresh_learner(client, email="filter@words.uz")
    await client.post(  # typing_race is premium-only (see FREE_GAME_TYPES)
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )

    body = (await client.get("/api/v1/games/typing_race?level=C1&count=6", headers=headers)).json()
    # typing_race answer is the headword; all must be the C1 "adv*" words.
    assert all(q["answer"].startswith("adv") for q in body["questions"])


async def test_bad_level_rejected(client):
    headers = await fresh_learner(client, email="bad@words.uz")
    r = await client.get("/api/v1/games/speed_quiz?level=Z9", headers=headers)
    assert r.status_code == 422


async def test_default_still_uses_own_cards(client):
    # No level/category -> unchanged behaviour: needs the user's own cards.
    headers = await fresh_learner(client, email="nocards@words.uz")
    r = await client.get("/api/v1/games/speed_quiz", headers=headers)
    assert r.status_code == 409  # no cards yet
