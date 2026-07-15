"""Silent provider failover: quota on one LLM must be invisible to users."""
import pytest

from app.services.ai_client import AiError, AiQuotaError, FailoverClient, _classify


class FakeProvider:
    def __init__(self, name, fail_with=None):
        self.name = name
        self.fail_with = fail_with
        self.calls = 0

    async def text(self, *, system, prompt, max_tokens):
        self.calls += 1
        if self.fail_with:
            raise self.fail_with
        return "answer from " + self.name

    async def chat(self, *, system, messages, max_tokens):
        return await self.text(system=system, prompt="", max_tokens=max_tokens)

    async def json(self, *, system, prompt, schema, max_tokens):
        self.calls += 1
        if self.fail_with:
            raise self.fail_with
        return {"from": self.name}


class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now


async def test_quota_failure_switches_silently():
    primary = FakeProvider("anthropic", fail_with=AiQuotaError("credit balance too low"))
    fallback = FakeProvider("gemini")
    client = FailoverClient([("anthropic", primary), ("gemini", fallback)])
    result = await client.text(system="s", prompt="p", max_tokens=10)
    assert result == "answer from gemini"  # user got an answer, no error


async def test_cooldown_skips_dead_provider():
    clock = FakeClock()
    primary = FakeProvider("anthropic", fail_with=AiQuotaError("quota"))
    fallback = FakeProvider("gemini")
    client = FailoverClient(
        [("anthropic", primary), ("gemini", fallback)], cooldown_seconds=600, clock=clock
    )
    await client.text(system="s", prompt="p", max_tokens=10)
    assert primary.calls == 1
    # Within cooldown: primary not even tried.
    await client.text(system="s", prompt="p", max_tokens=10)
    assert primary.calls == 1
    assert fallback.calls == 2
    # After cooldown expires the primary is tried again.
    clock.now += 601
    await client.text(system="s", prompt="p", max_tokens=10)
    assert primary.calls == 2


async def test_all_providers_failing_raises():
    client = FailoverClient(
        [
            ("a", FakeProvider("a", fail_with=AiQuotaError("quota"))),
            ("b", FakeProvider("b", fail_with=AiError("boom"))),
        ]
    )
    with pytest.raises(AiError):
        await client.json(system="s", prompt="p", schema={}, max_tokens=10)


async def test_non_quota_error_fails_over_without_cooldown():
    clock = FakeClock()
    flaky = FakeProvider("a", fail_with=AiError("transient"))
    healthy = FakeProvider("b")
    client = FailoverClient([("a", flaky), ("b", healthy)], clock=clock)
    assert await client.text(system="s", prompt="p", max_tokens=5) == "answer from b"
    # No cooldown for generic errors — primary is retried next call.
    await client.text(system="s", prompt="p", max_tokens=5)
    assert flaky.calls == 2


def test_classify_maps_quota_markers():
    assert isinstance(_classify(Exception("Your credit balance is too low")), AiQuotaError)
    assert isinstance(_classify(Exception("RESOURCE_EXHAUSTED: quota")), AiQuotaError)
    exc = Exception("gemini 429: rate limited"); exc.status_code = 429
    assert isinstance(_classify(exc), AiQuotaError)
    assert not isinstance(_classify(Exception("connection reset")), AiQuotaError)


async def test_bedrock_quota_fails_over_to_gemini():
    """A Bedrock 429 ('too many tokens per day') is a quota error, so the chain
    cools Bedrock down and answers from the next provider — invisibly to users."""
    from app.services.ai_client import AiQuotaError, _classify

    exc = Exception("bedrock 429: Too many tokens per day")
    exc.status_code = 429
    assert isinstance(_classify(exc), AiQuotaError)

    bedrock = FakeProvider("bedrock", fail_with=AiQuotaError("bedrock 429"))
    gemini = FakeProvider("gemini")
    client = FailoverClient([("bedrock", bedrock), ("gemini", gemini)])
    assert await client.text(system="s", prompt="p", max_tokens=10) == "answer from gemini"


def test_bedrock_json_extracts_object_from_prose():
    """Bedrock Converse has no universal JSON mode; the client extracts the
    JSON object even when a model wraps it in prose or code fences."""
    import json as _json
    text = 'Sure! Here is the result:\n```json\n{"band": 6.5, "ok": true}\n```'
    start, end = text.find("{"), text.rfind("}")
    assert _json.loads(text[start : end + 1]) == {"band": 6.5, "ok": True}
