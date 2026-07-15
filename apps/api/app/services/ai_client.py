"""Multi-provider LLM wrapper for the AI Tutor.

A thin `AiClient` protocol sits in front of the providers so endpoints stay
provider-agnostic and tests can inject a deterministic fake. Providers are
tried in priority order (Anthropic, then Gemini); when one fails — quota,
auth, outage — the next takes over silently and the failed one is put on a
cooldown so users never see the switch. Extended thinking is intentionally
*not* used — these are short generation tasks where latency and cost matter
more than deep reasoning (see docs/milestones/M6.md).
"""
import json
import time
from typing import Any, Callable, Dict, List, Optional, Protocol

from app.core.config import get_settings


class AiError(Exception):
    """Raised when the model call fails or returns unusable output."""


class AiQuotaError(AiError):
    """The provider is out of quota/credits or rate-limited — failover-worthy."""


class ChatTurn(Protocol):
    role: str
    content: str


class AiClient(Protocol):
    async def text(self, *, system: str, prompt: str, max_tokens: int) -> str: ...

    async def chat(
        self, *, system: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> str: ...

    async def json(
        self, *, system: str, prompt: str, schema: Dict[str, Any], max_tokens: int
    ) -> Any: ...


class AnthropicClient:
    def __init__(self) -> None:
        import anthropic  # imported lazily so the app runs without the dep configured

        settings = get_settings()
        self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self._model = settings.AI_MODEL

    @staticmethod
    def _join_text(content) -> str:
        return "".join(block.text for block in content if block.type == "text").strip()

    async def text(self, *, system: str, prompt: str, max_tokens: int) -> str:
        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
        except Exception as exc:  # network, auth, rate limit, refusal
            raise _classify(exc) from exc
        text = self._join_text(response.content)
        if not text:
            raise AiError("empty response")
        return text

    async def chat(
        self, *, system: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> str:
        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=max_tokens,
                system=system,
                messages=messages,
            )
        except Exception as exc:
            raise _classify(exc) from exc
        text = self._join_text(response.content)
        if not text:
            raise AiError("empty response")
        return text

    async def json(
        self, *, system: str, prompt: str, schema: Dict[str, Any], max_tokens: int
    ) -> Any:
        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": prompt}],
                output_config={"format": {"type": "json_schema", "schema": schema}},
            )
        except Exception as exc:
            raise _classify(exc) from exc
        text = self._join_text(response.content)
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise AiError("model did not return valid JSON") from exc


def _classify(exc: Exception) -> AiError:
    """Map a provider exception to AiError/AiQuotaError."""
    status = getattr(exc, "status_code", None)
    message = str(exc).lower()
    quota_markers = ("quota", "credit", "rate limit", "resource_exhausted", "overloaded")
    if status in (402, 429, 529) or any(marker in message for marker in quota_markers):
        return AiQuotaError(str(exc))
    return AiError(str(exc))


GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class GeminiClient:
    """Google Gemini via REST — no SDK dependency."""

    def __init__(self) -> None:
        settings = get_settings()
        self._key = settings.GEMINI_API_KEY
        self._model = settings.GEMINI_MODEL

    async def _generate(
        self,
        *,
        system: str,
        contents: List[Dict[str, Any]],
        max_tokens: int,
        json_mode: bool = False,
    ) -> str:
        import httpx

        config: Dict[str, Any] = {"maxOutputTokens": max_tokens}
        if json_mode:
            config["responseMimeType"] = "application/json"
        payload = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": contents,
            "generationConfig": config,
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    GEMINI_URL.format(model=self._model),
                    params={"key": self._key},
                    json=payload,
                )
        except Exception as exc:
            raise AiError(str(exc)) from exc
        if response.status_code != 200:
            exc = Exception("gemini {}: {}".format(response.status_code, response.text[:200]))
            exc.status_code = response.status_code  # type: ignore[attr-defined]
            raise _classify(exc)
        try:
            parts = response.json()["candidates"][0]["content"]["parts"]
            text = "".join(part.get("text", "") for part in parts).strip()
        except (KeyError, IndexError, ValueError) as exc:
            raise AiError("gemini returned no candidates") from exc
        if not text:
            raise AiError("empty response")
        return text

    async def text(self, *, system: str, prompt: str, max_tokens: int) -> str:
        return await self._generate(
            system=system,
            contents=[{"role": "user", "parts": [{"text": prompt}]}],
            max_tokens=max_tokens,
        )

    async def chat(
        self, *, system: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> str:
        contents = [
            {
                "role": "model" if m["role"] == "assistant" else "user",
                "parts": [{"text": m["content"]}],
            }
            for m in messages
        ]
        return await self._generate(system=system, contents=contents, max_tokens=max_tokens)

    async def json(
        self, *, system: str, prompt: str, schema: Dict[str, Any], max_tokens: int
    ) -> Any:
        # Gemini's schema dialect is a subset of JSON Schema, so the schema is
        # embedded in the prompt instead — with JSON output mode enforced.
        full_prompt = "{}\n\nRespond ONLY with JSON matching this schema:\n{}".format(
            prompt, json.dumps(schema)
        )
        text = await self._generate(
            system=system,
            contents=[{"role": "user", "parts": [{"text": full_prompt}]}],
            max_tokens=max_tokens,
            json_mode=True,
        )
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise AiError("model did not return valid JSON") from exc


BEDROCK_URL = "https://bedrock-runtime.{region}.amazonaws.com/model/{model}/converse"


class BedrockClient:
    """AWS Bedrock via the Converse API with a Bedrock API key (bearer token).

    The Converse shape is identical across Bedrock-hosted models (Claude, Nova,
    Llama…), so one implementation serves whichever model the account enables —
    set BEDROCK_MODEL/BEDROCK_REGION to switch. No AWS SDK / SigV4 needed."""

    def __init__(self) -> None:
        settings = get_settings()
        self._key = settings.BEDROCK_API_KEY
        self._region = settings.BEDROCK_REGION
        self._model = settings.BEDROCK_MODEL

    async def _converse(
        self, *, system: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> str:
        import httpx
        from urllib.parse import quote

        payload = {
            "system": [{"text": system}],
            "messages": [
                {"role": m["role"], "content": [{"text": m["content"]}]} for m in messages
            ],
            "inferenceConfig": {"maxTokens": max_tokens},
        }
        url = BEDROCK_URL.format(region=self._region, model=quote(self._model, safe=""))
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    url,
                    headers={
                        "Authorization": "Bearer {}".format(self._key),
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
        except Exception as exc:
            raise AiError(str(exc)) from exc
        if response.status_code != 200:
            exc = Exception("bedrock {}: {}".format(response.status_code, response.text[:200]))
            exc.status_code = response.status_code  # type: ignore[attr-defined]
            raise _classify(exc)
        try:
            blocks = response.json()["output"]["message"]["content"]
            text = "".join(b.get("text", "") for b in blocks).strip()
        except (KeyError, IndexError, ValueError) as exc:
            raise AiError("bedrock returned no content") from exc
        if not text:
            raise AiError("empty response")
        return text

    async def text(self, *, system: str, prompt: str, max_tokens: int) -> str:
        return await self._converse(
            system=system, messages=[{"role": "user", "content": prompt}], max_tokens=max_tokens
        )

    async def chat(
        self, *, system: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> str:
        return await self._converse(system=system, messages=messages, max_tokens=max_tokens)

    async def json(
        self, *, system: str, prompt: str, schema: Dict[str, Any], max_tokens: int
    ) -> Any:
        full_prompt = "{}\n\nRespond ONLY with JSON matching this schema:\n{}".format(
            prompt, json.dumps(schema)
        )
        text = await self._converse(
            system=system,
            messages=[{"role": "user", "content": full_prompt}],
            max_tokens=max_tokens,
        )
        # Models sometimes wrap JSON in prose/fences — extract the object.
        start, end = text.find("{"), text.rfind("}")
        candidate = text[start : end + 1] if start != -1 and end != -1 else text
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as exc:
            raise AiError("model did not return valid JSON") from exc


class FailoverClient:
    """Tries providers in order; a failing provider is cooled down so the next
    requests go straight to the healthy one. Users never see the switch."""

    def __init__(
        self,
        providers: List[tuple],  # (name, AiClient)
        cooldown_seconds: float = 600.0,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self._providers = providers
        self._cooldown = cooldown_seconds
        self._clock = clock
        self._cooldown_until: Dict[str, float] = {}

    def _available(self) -> List[tuple]:
        now = self._clock()
        ready = [
            (name, client)
            for name, client in self._providers
            if self._cooldown_until.get(name, 0.0) <= now
        ]
        # All cooled down? Try everything anyway rather than failing outright.
        return ready or self._providers

    async def _call(self, method: str, **kwargs: Any) -> Any:
        last_error: Optional[AiError] = None
        for name, client in self._available():
            try:
                return await getattr(client, method)(**kwargs)
            except AiError as exc:
                last_error = exc
                if isinstance(exc, AiQuotaError):
                    self._cooldown_until[name] = self._clock() + self._cooldown
        raise last_error or AiError("no AI providers configured")

    async def text(self, *, system: str, prompt: str, max_tokens: int) -> str:
        return await self._call("text", system=system, prompt=prompt, max_tokens=max_tokens)

    async def chat(
        self, *, system: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> str:
        return await self._call("chat", system=system, messages=messages, max_tokens=max_tokens)

    async def json(
        self, *, system: str, prompt: str, schema: Dict[str, Any], max_tokens: int
    ) -> Any:
        return await self._call(
            "json", system=system, prompt=prompt, schema=schema, max_tokens=max_tokens
        )


_client_singleton: Optional[AiClient] = None


def get_ai_client() -> Optional[AiClient]:
    """The configured client chain, or None when AI is disabled. Overridden in tests."""
    global _client_singleton
    settings = get_settings()
    if not settings.ai_enabled:
        return None
    if _client_singleton is None:
        # Order = priority. Bedrock (Claude-class quality) leads when present;
        # a direct Anthropic key, if set, takes precedence; Gemini backs them up.
        providers: List[tuple] = []
        if settings.ANTHROPIC_API_KEY:
            providers.append(("anthropic", AnthropicClient()))
        if settings.BEDROCK_API_KEY:
            providers.append(("bedrock", BedrockClient()))
        if settings.GEMINI_API_KEY:
            providers.append(("gemini", GeminiClient()))
        _client_singleton = FailoverClient(providers)
    return _client_singleton
