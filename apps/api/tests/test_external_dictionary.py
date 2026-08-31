import app.api.v1.vocabulary as vocab_routes
from app.services.external_dictionary import ExternalDefinition
from tests.conftest import register_user
from tests.test_ai import seed_word

FAKE_DEFINITION = ExternalDefinition(
    headword="hello",
    pos="interjection",
    ipa="/həˈloʊ/",
    definition_en="A greeting.",
    example_en="Hello, everyone.",
)


async def learner(client, email="dict-learner@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_requires_auth(client):
    resp = await client.post("/api/v1/words/define-external", json={"word": "hello"})
    assert resp.status_code == 401


async def test_creates_a_reviewable_word_from_the_external_source(client, monkeypatch):
    async def fake_fetch(word):
        return FAKE_DEFINITION

    monkeypatch.setattr(vocab_routes, "fetch_external_definition", fake_fetch)
    headers = await learner(client)
    resp = await client.post(
        "/api/v1/words/define-external", json={"word": "hello"}, headers=headers
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["headword"] == "hello"
    assert body["pos"] == "interjection"
    assert body["ipa"] == "/həˈloʊ/"
    assert body["status"] == "review"
    # No level data from this source — falls back to a mid-range default.
    assert body["cefr_level"] == "B1"
    assert body["senses"][0]["definition_en"] == "A greeting."
    assert body["senses"][0]["examples"][0]["text_en"] == "Hello, everyone."
    # No translation from this source either — falls back to the headword
    # itself rather than an empty string, same as the AI fallback's convention.
    assert body["senses"][0]["translation_uz"] == "hello"
    assert body["senses"][0]["translation_ru"] == "hello"


async def test_not_found_anywhere_returns_404_and_creates_nothing(client, monkeypatch):
    async def fake_fetch(word):
        return None

    monkeypatch.setattr(vocab_routes, "fetch_external_definition", fake_fetch)
    headers = await learner(client)
    resp = await client.post(
        "/api/v1/words/define-external", json={"word": "asdkjhaskjdh"}, headers=headers
    )
    assert resp.status_code == 404


async def test_reuses_an_existing_match_without_calling_the_external_api(client, monkeypatch):
    async def boom(word):
        raise AssertionError("should not call the external API for a word already in the corpus")

    monkeypatch.setattr(vocab_routes, "fetch_external_definition", boom)
    await seed_word(client)  # "apple", published
    headers = await learner(client)
    resp = await client.post(
        "/api/v1/words/define-external", json={"word": "APPLE"}, headers=headers
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["headword"] == "apple"
