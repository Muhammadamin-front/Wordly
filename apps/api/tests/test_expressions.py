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


async def test_expression_translation_follows_requested_locale(client):
    await seed_expression()

    uz = await client.get("/api/v1/expressions", params={"locale": "uz"})
    ru = await client.get("/api/v1/expressions", params={"locale": "ru"})
    en = await client.get("/api/v1/expressions", params={"locale": "en"})

    assert uz.json()["items"][0]["translation"] == "Umuman olganda"
    assert ru.json()["items"][0]["translation"] == "В целом"
    assert en.json()["items"][0]["translation"] == "Used to give a general conclusion."

    detail = await client.get("/api/v1/expressions/on-the-whole", params={"locale": "ru"})
    assert detail.status_code == 200
    assert detail.json()["translation"] == "В целом"


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
