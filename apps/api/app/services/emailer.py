import logging
from typing import List, Optional, Protocol

import httpx

from app.core.config import get_settings

logger = logging.getLogger("words.emailer")
RESEND_EMAILS_URL = "https://api.resend.com/emails"


class Emailer(Protocol):
    async def send(self, to: str, subject: str, body: str) -> None: ...


class ConsoleEmailer:
    """Development/test backend with an in-memory outbox."""

    outbox: List[dict] = []

    async def send(self, to: str, subject: str, body: str) -> None:
        message = {"to": to, "subject": subject, "body": body}
        ConsoleEmailer.outbox.append(message)
        logger.info("email_queued provider=console to=%s subject=%r", to, subject)


class EmailDeliveryError(RuntimeError):
    """A provider rejected or could not deliver an email request."""


class ResendEmailer:
    def __init__(
        self,
        api_key: str,
        sender: str,
        reply_to: Optional[str] = None,
        transport: Optional[httpx.AsyncBaseTransport] = None,
    ) -> None:
        self.api_key = api_key
        self.sender = sender
        self.reply_to = reply_to
        self.transport = transport

    async def send(self, to: str, subject: str, body: str) -> None:
        payload = {
            "from": self.sender,
            "to": [to],
            "subject": subject,
            "text": body,
        }
        if self.reply_to:
            payload["reply_to"] = self.reply_to

        try:
            async with httpx.AsyncClient(timeout=10.0, transport=self.transport) as client:
                response = await client.post(
                    RESEND_EMAILS_URL,
                    headers={"Authorization": "Bearer {}".format(self.api_key)},
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            status_code = exc.response.status_code if isinstance(exc, httpx.HTTPStatusError) else None
            logger.error(
                "email_delivery_failed provider=resend to=%s status=%s",
                to,
                status_code or "network_error",
            )
            raise EmailDeliveryError("Email delivery failed") from exc

        logger.info("email_sent provider=resend to=%s", to)


def get_emailer() -> Emailer:
    settings = get_settings()
    if settings.EMAIL_PROVIDER == "resend":
        if not settings.RESEND_API_KEY or not settings.EMAIL_FROM:
            raise RuntimeError("Resend email provider is not fully configured")
        return ResendEmailer(
            api_key=settings.RESEND_API_KEY,
            sender=settings.EMAIL_FROM,
            reply_to=settings.EMAIL_REPLY_TO,
        )
    if settings.ENVIRONMENT == "production":
        raise RuntimeError("Console email provider is disabled in production")
    return ConsoleEmailer()
