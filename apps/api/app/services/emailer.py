import logging
from dataclasses import dataclass
from typing import List, Optional, Protocol

import httpx

from app.core.config import get_settings

logger = logging.getLogger("words.emailer")
RESEND_EMAILS_URL = "https://api.resend.com/emails"


@dataclass(frozen=True)
class EmailMessage:
    subject: str
    body: str


def account_email(kind: str, *, link: Optional[str] = None) -> EmailMessage:
    """Small reusable, text-first templates for security-critical messages."""
    templates = {
        "verify": (
            "Vocora - hisobni tasdiqlash / Verify your account",
            "Agar bu so'rov sizdan bo'lmasa, xabarni e'tiborsiz qoldiring. "
            "Vocora hisobingizni tasdiqlash uchun quyidagi havolani oching:\n{}",
        ),
        "reset": (
            "Vocora - parolni tiklash / Reset your password",
            "Vocora hech qachon emailingiz orqali parolingizni so'ramaydi. "
            "Parolni yangilash uchun quyidagi bir martalik havolani oching:\n{}",
        ),
        "welcome": (
            "Vocora - xush kelibsiz / Welcome",
            "Hisobingiz tasdiqlandi. Bugungi birinchi darsingizni boshlashga tayyorsiz.",
        ),
        "password_changed": (
            "Vocora - parol yangilandi / Password changed",
            "Vocora parolingiz hozirgina yangilandi. Agar buni siz qilmagan bo'lsangiz, darhol support@vocora.uz ga murojaat qiling.",
        ),
    }
    subject, body = templates[kind]
    return EmailMessage(subject=subject, body=body.format(link) if "{}" in body else body)


class Emailer(Protocol):
    async def send(self, to: str, subject: str, body: str) -> None: ...


class ConsoleEmailer:
    """Development/test backend with an in-memory outbox."""

    outbox: List[dict] = []

    async def send(self, to: str, subject: str, body: str) -> None:
        message = {"to": to, "subject": subject, "body": body}
        ConsoleEmailer.outbox.append(message)
        logger.info("email_queued provider=console recipient_domain=%s", to.rpartition("@")[2])


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
                "email_delivery_failed provider=resend recipient_domain=%s status=%s",
                to.rpartition("@")[2],
                status_code or "network_error",
            )
            raise EmailDeliveryError("Email delivery failed") from exc

        logger.info("email_sent provider=resend recipient_domain=%s", to.rpartition("@")[2])


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
    # Production runtime validation rejects this development/test backend.
    return ConsoleEmailer()
