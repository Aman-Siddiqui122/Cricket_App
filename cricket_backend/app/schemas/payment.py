from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime

class PaymentBase(BaseModel):
    team_id: int
    amount: Decimal
    payment_method: str
    transaction_id: Optional[str] = None
    screenshot_url: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    status: str
    paid_by: int
    created_at: datetime

    class Config:
        from_attributes = True
