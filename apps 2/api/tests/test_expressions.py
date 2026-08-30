import app.db.session as db_session
from app.models.expression import Expression


async def seed_expression() -> None:
    async with db_session.get_session_factory()() as db:
        db.add(
            Expression(
                slug="on-the-whole",
                expression="On the whole",
                uzbek="Umuman olganda",
                russian="В целом",
                cefr="B1",
                ielts_band="6.0",
                category="Academic Connectors",
                formality="Neutral",
                usage="Used to give a general conclusion.",
                grammar_pattern="On the whole, + clause",
                native_notes="Natural in balanced conclusions.",
                common_mistakes=[],
                alternatives=["Overall"],
                example_sentences=["On the whole, the policy worked well."],
                collocations=[],
                synonyms=["Overall"],
                opposites=[],
            )
        )
        await db.commit()


async def seed_untranslated_expression() -> None:
    """A row with no Russian translation — the common case in the library."""
    async with db_session.get_session_factory()() as db:
        db.add(
            Expression(
                slug="break-the-ice",
                expression="Break the ice",
                uzbek="Muzni sindirmoq",
                russian=None,
                cefr="B1",
                ielts_band="6.0",
                category="Social",
                formality="Informal",
                usage="Used when someone makes a tense first meeting easier.",
                grammar_pattern="break the ice (with someone)",
                native_notes="Very common in small talk.",
                common_mistakes=[],
                alternatives=[],
                example_sentences=["A joke helped break the ice."],
                collocations=[],
                synonyms=[],
                opposites=[],
            )
        )
        await db.commit()


async def test_expression_translation_follows_requested_locale(client):
    await seed_expression()

    uz = await client.get("/api/v1/expressions", params={"locale": "uz"})
    ru = await client.get("/api/v1/expressions", params={"locale": "ru"})
    en = await client.get("/api/v1/expressions", params={"locale": "en"})

    assert uz.json()["items"][0]["translation"] == "Umuman olganda"
    assert ru.json()["items"][0]["translation"] == "В целом"
    # English has no translation column. `usage` is what the UI shows instead,
    # and it is returned in its own field rather than posing as a translation.
    assert en.json()["items"][0]["translation"] is None
    assert en.json()["items"][0]["usage"] == "Used to give a general conclusion."

    detail = await client.get("/api/v1/expressions/on-the-whole", params={"locale": "ru"})
    assert detail.status_code == 200
    assert detail.json()["translation"] == "В целом"


async def test_missing_translation_never_echoes_the_english_expression(client):
    """The Russian branch used to fall back to `expression`, which produced a
    flashcard reading "Break the ice" -> "Break the ice"."""
    await seed_untranslated_expression()

    for locale in ("ru", "en"):
        item = (
            await client.get("/api/v1/expressions", params={"locale": locale})
        ).json()["items"][0]
        assert item["translation"] is None
        assert item["flashcard_back"] != item["expression"]
        assert item["flashcard_back"] == "Muzni sindirmoq"


async def test_flashcard_back_is_always_a_real_translation(client):
    await seed_expression()

    backs = {
        locale: (
            await client.get("/api/v1/expressions", params={"locale": locale})
        ).json()["items"][0]["flashcard_back"]
        for locale in ("uz", "ru", "en")
    }

    assert backs["uz"] == "Umuman olganda"
    assert backs["ru"] == "В целом"
    assert backs["en"] == "Umuman olganda"  # falls back to Uzbek, not to `usage`
    assert "Used to give" not in backs["en"]


async def test_expression_search_uses_current_locale(client):
    await seed_expression()

    assert (
        await client.get("/api/v1/expressions", params={"locale": "ru", "q": "целом"})
    ).json()["total"] == 1
    assert (
        await client.get("/api/v1/expressions", params={"locale": "ru", "q": "Umuman"})
    ).json()["total"] == 0
    assert (
        await client.get("/api/v1/expressions", params={"locale": "uz", "q": "Umuman"})
    ).json()["total"] == 1
