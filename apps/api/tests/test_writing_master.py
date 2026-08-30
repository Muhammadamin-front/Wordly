"""Master Writing curriculum: drill scoring, unit gating, progress sync,
and the target_band_score profile field."""
from typing import Any
from uuid import uuid4

from app.api.v1.ielts import require_ai_client
from app.main import app
from tests.conftest import register_user


class FakeDrillAi:
    """Returns a fixed 'good' verdict for either drill schema."""

    async def text(self, *, system, prompt, max_tokens) -> str:
        return "ok"

    async def chat(self, *, system, messages, max_tokens) -> str:
        return "ok"

    async def json(self, *, system, prompt, schema, max_tokens) -> Any:
        assert set(schema["properties"]) == {"quality", "feedback", "model_example"}
        return {
            "quality": "good",
            "feedback": "Meaning is preserved but wording is close to the original.",
            "model_example": "A model sentence.",
        }


def use_fake_drill_ai() -> None:
    app.dependency_overrides[require_ai_client] = lambda: FakeDrillAi()


async def learner(client, email="master-writing@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def make_premium(client, headers) -> None:
    resp = await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )
    assert resp.status_code == 200, resp.text


# --- Drill scoring + gating ---------------------------------------------------


async def test_free_user_reaches_the_free_unit_drill(client):
    use_fake_drill_ai()
    try:
        headers = await learner(client, "drill-free-unit@words.uz")
        resp = await client.post(
            "/api/v1/ielts/writing/master/paraphrase-check",
            json={
                "unit_slug": "process",
                "original_title": "The diagram below shows how bamboo fabric is made.",
                "paraphrase": "The illustration outlines the manufacturing stages of bamboo textiles.",
            },
            headers=headers,
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["quality"] == "good"
        assert body["score"] == 75
        assert body["model_example"]
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_free_user_is_blocked_from_a_locked_unit_before_any_ai_call(client):
    """The 402 must fire before the model is ever called — a locked unit costs
    nothing, not even a wasted AI request."""

    class ExplodingAi:
        async def json(self, *args, **kwargs):
            raise AssertionError("must not be called for a locked unit")

    app.dependency_overrides[require_ai_client] = lambda: ExplodingAi()
    try:
        headers = await learner(client, "drill-locked-unit@words.uz")
        resp = await client.post(
            "/api/v1/ielts/writing/master/paraphrase-check",
            json={
                "unit_slug": "bar-chart",
                "original_title": "The chart below shows internet usage by age group.",
                "paraphrase": "The graph illustrates daily internet use across age brackets.",
            },
            headers=headers,
        )
        assert resp.status_code == 402
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_premium_reaches_every_unit(client):
    use_fake_drill_ai()
    try:
        headers = await learner(client, "drill-premium@words.uz")
        await make_premium(client, headers)
        for unit in ("process", "bar-chart", "line-graph", "table", "pie-chart"):
            resp = await client.post(
                "/api/v1/ielts/writing/master/overview-check",
                json={
                    "unit_slug": unit,
                    "visual": {"kind": "bar", "title": "x", "categories": ["A"], "series": []},
                    "overview": "Overall, the values differ significantly between categories.",
                },
                headers=headers,
            )
            assert resp.status_code == 200, (unit, resp.text)
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_quality_tiers_map_to_a_deterministic_score(client):
    """The model chooses the tier; the score is ours, not the model's — this
    is what the client posts to the progress endpoint, so it must never
    depend on the model inventing a number."""

    class TieredAi:
        def __init__(self, quality):
            self.quality = quality

        async def json(self, *, system, prompt, schema, max_tokens):
            return {"quality": self.quality, "feedback": "-", "model_example": "-"}

    headers = await learner(client, "drill-tiers@words.uz")
    for quality, expected_score in (("needs_work", 40), ("good", 75), ("excellent", 100)):
        app.dependency_overrides[require_ai_client] = lambda q=quality: TieredAi(q)
        try:
            resp = await client.post(
                "/api/v1/ielts/writing/master/paraphrase-check",
                json={
                    "unit_slug": "process",
                    "original_title": "The diagram below shows how bamboo fabric is made.",
                    "paraphrase": "Fabric from bamboo is produced through several steps.",
                },
                headers=headers,
            )
            assert resp.status_code == 200, resp.text
            assert resp.json()["score"] == expected_score
        finally:
            app.dependency_overrides.pop(require_ai_client, None)


async def test_an_unknown_quality_value_falls_back_to_needs_work(client):
    """A malformed/hallucinated tier must not silently score as passing."""

    class RogueAi:
        async def json(self, *args, **kwargs):
            return {"quality": "amazing", "feedback": "-", "model_example": "-"}

    app.dependency_overrides[require_ai_client] = lambda: RogueAi()
    try:
        headers = await learner(client, "drill-rogue@words.uz")
        resp = await client.post(
            "/api/v1/ielts/writing/master/paraphrase-check",
            json={
                "unit_slug": "process",
                "original_title": "The diagram below shows how bamboo fabric is made.",
                "paraphrase": "Fabric from bamboo is produced through several steps.",
            },
            headers=headers,
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["quality"] == "needs_work"
        assert body["score"] == 40
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


# --- Progress sync -------------------------------------------------------------


async def test_attempt_then_get_round_trips(client):
    headers = await learner(client, "progress-roundtrip@words.uz")
    resp = await client.post(
        "/api/v1/me/writing-master-progress/attempt",
        json={"attempt_id": str(uuid4()), "unit_slug": "process", "score": 75},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    assert resp.json() == {
        "unit_slug": "process", "attempts": 1, "best_score": 75, "last_score": 75,
        "updated_at": resp.json()["updated_at"],
    }

    resp = await client.get("/api/v1/me/writing-master-progress", headers=headers)
    assert resp.status_code == 200
    assert [e["unit_slug"] for e in resp.json()["entries"]] == ["process"]


async def test_repeat_attempt_id_is_idempotent(client):
    headers = await learner(client, "progress-idempotent@words.uz")
    attempt_id = str(uuid4())
    body = {"attempt_id": attempt_id, "unit_slug": "process", "score": 40}
    first = await client.post(
        "/api/v1/me/writing-master-progress/attempt", json=body, headers=headers
    )
    assert first.status_code == 200
    second = await client.post(
        "/api/v1/me/writing-master-progress/attempt", json=body, headers=headers
    )
    assert second.status_code == 200
    assert second.json()["attempts"] == 1  # not 2 — the retry did not double-count


async def test_free_user_cannot_post_an_attempt_for_a_locked_unit(client):
    headers = await learner(client, "progress-locked-attempt@words.uz")
    resp = await client.post(
        "/api/v1/me/writing-master-progress/attempt",
        json={"attempt_id": str(uuid4()), "unit_slug": "bar-chart", "score": 100},
        headers=headers,
    )
    assert resp.status_code == 402


async def test_premium_user_can_post_an_attempt_for_any_unit(client):
    headers = await learner(client, "progress-premium-attempt@words.uz")
    await make_premium(client, headers)
    resp = await client.post(
        "/api/v1/me/writing-master-progress/attempt",
        json={"attempt_id": str(uuid4()), "unit_slug": "pie-chart", "score": 100},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text


async def test_sync_drops_locked_entries_for_free_user(client):
    """A snapshot upload is routine background traffic, not one deliberate
    action — a lapsed-subscription device must not get a hard 402 on every
    app boot, it should just stop gaining ground on units it can't access."""
    headers = await learner(client, "progress-sync-drop@words.uz")
    resp = await client.post(
        "/api/v1/me/writing-master-progress/sync",
        json={
            "entries": [
                {
                    "unit_slug": "process", "attempts": 1, "best_score": 80, "last_score": 80,
                    "updated_at": "2026-01-01T00:00:00",
                },
                {
                    "unit_slug": "bar-chart", "attempts": 1, "best_score": 80, "last_score": 80,
                    "updated_at": "2026-01-01T00:00:00",
                },
            ]
        },
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    slugs = {e["unit_slug"] for e in resp.json()["entries"]}
    assert slugs == {"process"}


# --- target_band_score ---------------------------------------------------------


async def test_target_band_score_round_trips_through_profile_update(client):
    headers = await learner(client, "band-goal@words.uz")
    resp = await client.patch(
        "/api/v1/users/me", json={"target_band_score": 7.0}, headers=headers
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["profile"]["target_band_score"] == 7.0


async def test_target_band_score_rejects_off_half_step_values(client):
    headers = await learner(client, "band-goal-invalid@words.uz")
    resp = await client.patch(
        "/api/v1/users/me", json={"target_band_score": 6.7}, headers=headers
    )
    assert resp.status_code == 422


async def test_target_band_score_rejects_out_of_range_values(client):
    headers = await learner(client, "band-goal-range@words.uz")
    resp = await client.patch(
        "/api/v1/users/me", json={"target_band_score": 9.5}, headers=headers
    )
    assert resp.status_code == 422
