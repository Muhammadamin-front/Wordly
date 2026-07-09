"""Claude API wrapper for the AI Tutor.

A thin `AiClient` protocol sits in front of the Anthropic SDK so endpoints stay
provider-agnostic and tests can inject a deterministic fake. Extended thinking
is intentionally *not* used — these are short generation tasks where latency and
cost matter more than deep reasoning (see docs/milestones/M6.md).
"""
import json
from typing import Any, Dict, List, Optional, Protocol

from app.core.config import get_settings


class AiError(Exception):
    """Raised when the model call fails or returns unusable output."""


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
            raise AiError(str(exc)) from exc
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
            raise AiError(str(exc)) from exc
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
            raise AiError(str(exc)) from exc
        text = self._join_text(response.content)
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise AiError("model did not return valid JSON") from exc


_client_singleton: Optional[AnthropicClient] = None


def get_ai_client() -> Optional[AiClient]:
    """The configured client, or None when AI is disabled. Overridden in tests."""
    global _client_singleton
    settings = get_settings()
    if not settings.ai_enabled:
        return None
    if _client_singleton is None:
        _client_singleton = AnthropicClient()
    return _client_singleton
