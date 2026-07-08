import logging
from typing import List, Protocol

logger = logging.getLogger("words.emailer")


class Emailer(Protocol):
    async def send(self, to: str, subject: str, body: str) -> None: ...


class ConsoleEmailer:
    """Dev/test backend: logs the email and keeps it in an in-memory outbox.
    Swapped for an SMTP/provider backend before public launch (M7 infra)."""

    outbox: List[dict] = []

    async def send(self, to: str, subject: str, body: str) -> None:
        message = {"to": to, "subject": subject, "body": body}
        ConsoleEmailer.outbox.append(message)
        logger.info("EMAIL to=%s subject=%r\n%s", to, subject, body)


def get_emailer() -> Emailer:
    return ConsoleEmailer()
