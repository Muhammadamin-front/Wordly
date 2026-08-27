from typing import Any, Dict, List

from app.api.v1.ai import require_ai_client
from app.core.config import get_settings
from app.main import app
from tests.conftest import register_user
from tests.test_vocabulary import WORD_PAYLOAD, make_admin


class FakeAiClient:
    """Deterministic stand-in for the AI provider client — no network, no key."""

    def __init__(self) -> None:
        self.calls: List[str] = []

    async def text(self, *, system: str, prompt: str, max_tokens: int) -> str:
        self.calls.append("text")
        return "AI explanation about the word."

    async def chat(self, *, system, messages, max_tokens) -> str:
        self.calls.append("chat")
        return "That's great! What did you do next?"

    #: overrides the canned define-word response for individual tests.
    define_word_response: Dict[str, Any] = None

    async def json(self, *, system, prompt, schema, max_tokens) -> Any:
        self.calls.append("json")
        if "questions" in schema["properties"]:
            return {
                "questions": [
                    {"prompt": "What does 'apple' mean?", "options": ["olma", "non", "suv", "choy"], "answer_index": 0}
                ]
            }
        if "recognized" in schema["properties"]:
            if self.define_word_response is not None:
                return self.define_word_response
            return {
                "recognized": True,
                "headword": "slight",
                "pos": "adjective",
                "cefr_level": "B1",
                "translation_uz": "sezilarli emas",
                "translation_ru": "незначительный",
                "definition_en": "very small in degree or amount.",
                "example_en": "There was a slight improvement in her grades.",
            }
        return {"corrected": "I went to school.", "feedback": "Use past tense 'went'."}


def use_fake(fake: FakeAiClient) -> None:
    app.dependency_overrides[require_ai_client] = lambda: fake


async def seed_word(client, **overrides) -> dict:
    admin_headers = await make_admin(client)
    response = await client.post(
        "/api/v1/admin/words", json={**WORD_PAYLOAD, **overrides}, headers=admin_headers
    )
    assert response.status_code == 201, response.text
    return response.json()


async def learner(client) -> dict:
    data = await register_user(client, email="learner@words.uz")
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_ai_requires_auth(client):
    assert (await client.get("/api/v1/ai/quota")).status_code == 401


async def test_quota_reports_free_tier(client):
    headers = await learner(client)
    body = (await client.get("/api/v1/ai/quota", headers=headers)).json()
    assert body["daily_quota"] == 5
    assert body["remaining"] == 5
    assert body["enabled"] is False  # no key configured in tests


async def test_explain_when_not_configured_returns_503(client):
    # No dependency override → require_ai_client sees no configured key.
    word = await seed_word(client)
    headers = await learner(client)
    response = await client.post(
        "/api/v1/ai/explain", json={"word_id": word["id"]}, headers=headers
    )
    assert response.status_code == 503


async def test_explain_returns_labeled_text_and_consumes_quota(client):
    fake = FakeAiClient()
    use_fake(fake)
    try:
        word = await seed_word(client)
        headers = await learner(client)
        response = await client.post(
            "/api/v1/ai/explain", json={"word_id": word["id"]}, headers=headers
        )
        assert response.status_code == 200, response.text
        assert response.json()["ai_generated"] is True
        assert "explanation" in response.json()["text"]

        quota = (await client.get("/api/v1/ai/quota", headers=headers)).json()
        assert quota["remaining"] == 4  # one action consumed
        assert fake.calls == ["text"]
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_quota_enforced_after_limit(client):
    fake = FakeAiClient()
    use_fake(fake)
    settings = get_settings()
    original = settings.AI_FREE_DAILY_QUOTA
    settings.AI_FREE_DAILY_QUOTA = 2
    try:
        word = await seed_word(client)
        headers = await learner(client)
        for _ in range(2):
            ok = await client.post(
                "/api/v1/ai/explain", json={"word_id": word["id"]}, headers=headers
            )
            assert ok.status_code == 200
        blocked = await client.post(
            "/api/v1/ai/explain", json={"word_id": word["id"]}, headers=headers
        )
        assert blocked.status_code == 429
    finally:
        settings.AI_FREE_DAILY_QUOTA = original
        app.dependency_overrides.pop(require_ai_client, None)


async def test_chat_level_adapted(client):
    fake = FakeAiClient()
    use_fake(fake)
    try:
        headers = await learner(client)
        response = await client.post(
            "/api/v1/ai/chat",
            json={"messages": [{"role": "user", "content": "I go to school today"}], "level": "A1"},
            headers=headers,
        )
        assert response.status_code == 200
        assert fake.calls == ["chat"]
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_quiz_structured_output(client):
    fake = FakeAiClient()
    use_fake(fake)
    try:
        for i in range(3):
            await seed_word(client, headword="w{}".format(i))
        headers = await learner(client)
        response = await client.post(
            "/api/v1/ai/quiz", json={"cefr_level": "A1", "count": 3}, headers=headers
        )
        assert response.status_code == 200, response.text
        q = response.json()["questions"][0]
        assert q["answer_index"] == 0
        assert len(q["options"]) == 4
        assert q["ai_generated"] is True
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_writing_check(client):
    fake = FakeAiClient()
    use_fake(fake)
    try:
        headers = await learner(client)
        response = await client.post(
            "/api/v1/ai/writing-check", json={"text": "I go to school yesterday"}, headers=headers
        )
        assert response.status_code == 200
        body = response.json()
        assert body["corrected"] == "I went to school."
        assert body["ai_generated"] is True
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_story_needs_three_words(client):
    fake = FakeAiClient()
    use_fake(fake)
    try:
        headers = await learner(client)  # learner has no cards
        response = await client.post("/api/v1/ai/story", json={}, headers=headers)
        assert response.status_code == 400
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_report_is_stored(client):
    headers = await learner(client)
    response = await client.post(
        "/api/v1/ai/report",
        json={"kind": "explain", "output": "wrong info", "reason": "inaccurate"},
        headers=headers,
    )
    assert response.status_code == 201

    import app.db.session as db_session
    from sqlalchemy import select
    from app.models.ai import AiReport

    async with db_session.get_session_factory()() as session:
        reports = (await session.scalars(select(AiReport))).all()
    assert len(reports) == 1
    assert reports[0].kind == "explain"


async def test_define_word_creates_a_reviewable_ai_generated_word(client):
    fake = FakeAiClient()
    use_fake(fake)
    try:
        headers = await learner(client)
        response = await client.post(
            "/api/v1/ai/define-word", json={"word": "slightly"}, headers=headers
        )
        assert response.status_code == 201, response.text
        body = response.json()
        # The corpus lookup (with inflection-guessing) ran first and found
        # nothing for "slightly", so the AI's corrected headword "slight" is
        # what actually got created.
        assert body["headword"] == "slight"
        assert body["status"] == "review"  # stays out of the public catalogue
        assert body["ai_generated"] is True
        assert body["senses"][0]["translation_uz"] == "sezilarli emas"
        assert fake.calls == ["json"]

        quota = (await client.get("/api/v1/ai/quota", headers=headers)).json()
        assert quota["remaining"] == 4  # one action consumed
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_define_word_reuses_an_existing_match_without_calling_ai(client):
    await seed_word(client)  # "apple", published
    fake = FakeAiClient()
    use_fake(fake)
    try:
        headers = await learner(client)
        response = await client.post(
            "/api/v1/ai/define-word", json={"word": "APPLE"}, headers=headers
        )
        assert response.status_code == 201, response.text
        assert response.json()["headword"] == "apple"
        assert fake.calls == []  # no AI call, no quota spent

        quota = (await client.get("/api/v1/ai/quota", headers=headers)).json()
        assert quota["remaining"] == 5  # untouched
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_define_word_rejects_gibberish_without_creating_anything(client):
    fake = FakeAiClient()
    fake.define_word_response = {
        "recognized": False,
        "headword": "",
        "pos": "noun",
        "cefr_level": "A1",
        "translation_uz": "",
        "translation_ru": "",
        "definition_en": "",
        "example_en": "",
    }
    use_fake(fake)
    try:
        headers = await learner(client)
        response = await client.post(
            "/api/v1/ai/define-word", json={"word": "asdkjhaskjdh"}, headers=headers
        )
        assert response.status_code == 404

        # Still consumed — the AI call itself succeeded, it just correctly
        # judged the input unrecognizable; that's not a free retry.
        quota = (await client.get("/api/v1/ai/quota", headers=headers)).json()
        assert quota["remaining"] == 4
    finally:
        app.dependency_overrides.pop(require_ai_client, None)
