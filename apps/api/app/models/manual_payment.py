"""Card-transfer payment requests.

Payme and Click are not live yet, so learners transfer the price to a card
and send the receipt on Telegram. Before this table that flow left no trace:
the learner had no way to know their message was received, and nobody could
see who had paid and was waiting. A row here is that receipt — raised by the
learner pressing "I have paid", cleared by staff when the subscription is
granted.

It records no card or transfer data: only which plan was intended, what it
cost at the time, and when. The money itself moves entirely outside this
system.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base

MANUAL_PAYMENT_PENDING = "pending"
MANUAL_PAYMENT_ACTIVATED = "activated"
MANUAL_PAYMENT_REJECTED = "rejected"


class ManualPaymentRequest(Base):
    __tablename__ = "manual_payment_requests"
    __table_args__ = (
        # Staff view: everything still waiting, oldest first.
        Index("ix_manual_payments_status_created", "status", "created_at"),
        # "Does this learner already have one open?"
        Index("ix_manual_payments_user_status", "user_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    plan_code: Mapped[str] = mapped_column(String(24), nullable=False)
    amount_som: Mapped[int] = mapped_column(Integer, nullable=False)
    # Short, human-sayable, and unique per request: the learner quotes it in
    # their Telegram message so staff can match a receipt to a row.
    reference: Mapped[str] = mapped_column(String(12), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(12), default=MANUAL_PAYMENT_PENDING, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
