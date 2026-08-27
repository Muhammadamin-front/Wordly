from sqlalchemy import update

import app.db.session as db_session
from app.models.user import User
from tests.conftest import register_user

WORD_PAYLOAD = {
    "headword": "apple",
    "pos": "noun",
    "cefr_level": "A1",
    "ipa": "ˈæp.əl",
    "frequency_rank": 120,
    "status": "published",
    "senses": [
        {
            "definition_en": "A round fruit with red or green skin.",
            "translation_uz": "olma",
            "translation_ru": "яблоко",
            "examples": [{"text_en": "I eat an apple every day.", "text_uz": "Men har kuni olma yeyman."}],
        }
    ],
    "relations": [{"relation_type": "synonym", "related_text": "fruit"}],
}


async def make_admin(client) -> dict:
    """Idempotent: registers admin@words.uz on first call, logs in afterwards."""
    from tests.conftest import REGISTER_PAYLOAD

    response = await client.post(
        "/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "admin@words.uz"}
    )
    if response.status_code == 409:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@words.uz", "password": REGISTER_PAYLOAD["password"]},
        )
    assert response.status_code in (200, 201), response.text
    async with db_session.get_session_factory()() as session:
        await session.execute(
            update(User).where(User.email == "admin@words.uz").values(role="admin")
        )
        await session.commit()
    return {"Authorization": "Bearer " + response.json()["access_token"]}


async def make_super_admin(client) -> dict:
    headers = await make_admin(client)
    async with db_session.get_session_factory()() as session:
        await session.execute(
            update(User).where(User.email == "admin@words.uz").values(role="super_admin")
        )
        await session.commit()
    return headers


async def make_content_manager(client) -> dict:
    from tests.conftest import REGISTER_PAYLOAD

    response = await client.post(
        "/api/v1/auth/register", json={**REGISTER_PAYLOAD, "email": "content@words.uz"}
    )
    assert response.status_code == 201, response.text
    async with db_session.get_session_factory()() as session:
        await session.execute(
            update(User).where(User.email == "content@words.uz").values(role="content_manager")
        )
        await session.commit()
    return {"Authorization": "Bearer " + response.json()["access_token"]}


async def test_admin_endpoints_require_admin_role(client):
    data = await register_user(client)  # plain learner
    headers = {"Authorization": "Bearer " + data["access_token"]}
    response = await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)
    assert response.status_code == 403
    assert (await client.post("/api/v1/admin/words", json=WORD_PAYLOAD)).status_code == 401


async def test_content_manager_can_manage_words_without_user_admin_access(client):
    headers = await make_content_manager(client)
    created = await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)
    assert created.status_code == 201, created.text
    assert (await client.get("/api/v1/admin/users", headers=headers)).status_code == 403


async def test_create_and_fetch_word(client):
    headers = await make_admin(client)
    created = await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["slug"] == "apple-noun"
    assert body["senses"][0]["translation_uz"] == "olma"
    assert body["senses"][0]["examples"][0]["text_en"] == "I eat an apple every day."
    assert body["relations"][0]["related_text"] == "fruit"

    detail = await client.get("/api/v1/words/apple-noun")
    assert detail.status_code == 200
    assert detail.json()["headword"] == "apple"


async def test_public_list_hides_unpublished(client):
    headers = await make_admin(client)
    await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)
    draft = {**WORD_PAYLOAD, "headword": "banana", "status": "draft"}
    await client.post("/api/v1/admin/words", json=draft, headers=headers)

    public = await client.get("/api/v1/words")
    slugs = [w["slug"] for w in public.json()["items"]]
    assert "apple-noun" in slugs and "banana-noun" not in slugs
    assert public.json()["total"] == 1

    meta = await client.get("/api/v1/catalog/meta")
    assert meta.status_code == 200
    assert meta.json() == {
        "word_total": 1,
        "expression_total": 0,
        "learning_item_total": 1,
        "levels": {"A1": 1},
    }

    # Draft detail page 404s publicly but is visible to admin.
    assert (await client.get("/api/v1/words/banana-noun")).status_code == 404
    admin_list = await client.get("/api/v1/admin/words?status=draft", headers=headers)
    assert admin_list.json()["total"] == 1


async def test_search_matches_headword_and_translations(client):
    headers = await make_admin(client)
    await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)

    for query in ("app", "olma", "яблоко"):
        response = await client.get("/api/v1/words", params={"q": query})
        assert response.json()["total"] == 1, query
    assert (await client.get("/api/v1/words", params={"q": "zzz"})).json()["total"] == 0
    assert (await client.get("/api/v1/words", params={"level": "B2"})).json()["total"] == 0


async def test_search_matches_an_inflected_form_against_the_base_headword(client):
    headers = await make_admin(client)
    slight = {**WORD_PAYLOAD, "headword": "slight", "pos": "adjective"}
    await client.post("/api/v1/admin/words", json=slight, headers=headers)

    # "slight" is not a substring of "slightly", so only the inflection-aware
    # branch of the search finds it.
    response = await client.get("/api/v1/words", params={"q": "slightly"})
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["headword"] == "slight"


async def test_word_lookup_matches_published_headwords_case_insensitively(client):
    headers = await make_admin(client)
    await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)
    draft = {**WORD_PAYLOAD, "headword": "banana", "status": "draft"}
    await client.post("/api/v1/admin/words", json=draft, headers=headers)

    response = await client.post(
        "/api/v1/words/lookup",
        json={"headwords": ["APPLE", "banana", "not-a-real-word"]},
    )
    assert response.status_code == 200
    entries = response.json()["entries"]
    # Case-insensitive match, keyed by the lowercased headword.
    assert entries["apple"]["translation_uz"] == "olma"
    assert entries["apple"]["translation_ru"] == "яблоко"
    assert entries["apple"]["definition_en"] == "A round fruit with red or green skin."
    # Draft (unpublished) and unknown words are simply absent, not null entries.
    assert "banana" not in entries
    assert "not-a-real-word" not in entries


async def test_word_lookup_matches_inflected_forms_against_the_base_headword(client):
    headers = await make_admin(client)
    await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)

    response = await client.post("/api/v1/words/lookup", json={"headwords": ["apples"]})
    assert response.status_code == 200
    entries = response.json()["entries"]
    # Keyed by the word as it appeared in the passage text, not the lemma
    # the match was found under — the frontend looks it up by surface form.
    assert "apples" in entries
    assert entries["apples"]["headword"] == "apple"
    assert entries["apples"]["translation_uz"] == "olma"


async def test_word_lookup_rejects_empty_and_oversized_batches(client):
    assert (await client.post("/api/v1/words/lookup", json={"headwords": []})).status_code == 422
    too_many = {"headwords": [f"word{i}" for i in range(301)]}
    assert (await client.post("/api/v1/words/lookup", json=too_many)).status_code == 422


async def test_update_replaces_senses_and_publish_workflow(client):
    headers = await make_admin(client)
    created = await client.post(
        "/api/v1/admin/words", json={**WORD_PAYLOAD, "status": "review"}, headers=headers
    )
    word_id = created.json()["id"]

    updated = await client.patch(
        "/api/v1/admin/words/{}".format(word_id),
        json={
            "status": "published",
            "senses": [
                {
                    "definition_en": "A sweet round fruit.",
                    "translation_uz": "olma (meva)",
                    "translation_ru": "яблоко (фрукт)",
                }
            ],
        },
        headers=headers,
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["status"] == "published"
    assert len(updated.json()["senses"]) == 1
    assert updated.json()["senses"][0]["translation_uz"] == "olma (meva)"

    assert (await client.get("/api/v1/words/apple-noun")).status_code == 200


async def test_delete_word(client):
    headers = await make_admin(client)
    created = await client.post("/api/v1/admin/words", json=WORD_PAYLOAD, headers=headers)
    word_id = created.json()["id"]
    assert (
        await client.delete("/api/v1/admin/words/{}".format(word_id), headers=headers)
    ).status_code == 200
    assert (await client.get("/api/v1/words/apple-noun")).status_code == 404


CSV_GOOD = """headword,pos,cefr_level,translation_uz,translation_ru,definition_en,ipa,frequency_rank,example_en,synonyms,status
book,noun,A1,kitob,книга,Pages with words that you read.,bʊk,90,I read a book at night.,volume,published
water,noun,A1,suv,вода,A clear liquid that we drink.,ˈwɔː.tər,45,Please drink more water.,,published
"""

CSV_WITH_BAD_ROW = CSV_GOOD + "bad,,Z9,,,,,,,,published\n"


async def test_csv_import_creates_and_updates(client):
    headers = await make_admin(client)
    response = await client.post(
        "/api/v1/admin/words/import",
        files={"file": ("words.csv", CSV_GOOD.encode(), "text/csv")},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    assert response.json() == {"created": 2, "updated": 0, "errors": []}

    # Re-import updates in place instead of duplicating.
    again = await client.post(
        "/api/v1/admin/words/import",
        files={"file": ("words.csv", CSV_GOOD.encode(), "text/csv")},
        headers=headers,
    )
    assert again.json()["created"] == 0
    assert again.json()["updated"] == 2
    assert (await client.get("/api/v1/words")).json()["total"] == 2


async def test_csv_import_reports_bad_rows_and_continues(client):
    headers = await make_admin(client)
    response = await client.post(
        "/api/v1/admin/words/import",
        files={"file": ("words.csv", CSV_WITH_BAD_ROW.encode(), "text/csv")},
        headers=headers,
    )
    report = response.json()
    assert report["created"] == 2
    assert len(report["errors"]) == 1
    assert "line 4" in report["errors"][0]


async def test_csv_import_rejects_missing_columns(client):
    headers = await make_admin(client)
    response = await client.post(
        "/api/v1/admin/words/import",
        files={"file": ("words.csv", b"headword,pos\napple,noun\n", "text/csv")},
        headers=headers,
    )
    assert response.json()["created"] == 0
    assert "Missing columns" in response.json()["errors"][0]


async def test_csv_reimport_preserves_image_url(client):
    """Enrichment fields (image_url) aren't in corpus CSVs, so a re-import must
    not wipe them (regression: re-seeding used to blank every picture)."""
    headers = await make_admin(client)
    created = await client.post(
        "/api/v1/admin/words", json={**WORD_PAYLOAD, "headword": "melon"}, headers=headers
    )
    word_id = created.json()["id"]
    # Enrich the word with an image, as scripts/enrich_images does.
    await client.patch(
        f"/api/v1/admin/words/{word_id}",
        json={"image_url": "https://example.com/melon.jpg"},
        headers=headers,
    )
    # Re-import the same word via CSV (no image column).
    csv_text = (
        "headword,pos,cefr_level,definition_en,translation_uz,translation_ru,"
        "ipa,frequency_rank,status\n"
        "melon,noun,A1,A sweet fruit,qovun,дыня,,130,published\n"
    )
    report = await client.post(
        "/api/v1/admin/words/import",
        files={"file": ("w.csv", csv_text.encode(), "text/csv")},
        headers=headers,
    )
    assert report.json()["updated"] == 1
    detail = await client.get(f"/api/v1/admin/words/{word_id}", headers=headers)
    assert detail.json()["image_url"] == "https://example.com/melon.jpg"
