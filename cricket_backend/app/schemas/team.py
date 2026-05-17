from pydantic import BaseModel
from typing import Optional
from datetime import date

class TeamCreate(BaseModel):
    name: str
    contact_number: Optional[str] = None
    jazzcash_number: Optional[str] = None
    home_ground_id: Optional[int] = None

class TeamResponse(BaseModel):
    id: int
    name: str
    contact_number: Optional[str]
    jazzcash_number: Optional[str]
    subscription_status: str
    subscription_end: Optional[date]
    admin_id: int
    players_count: int = 0

    class Config:
        from_attributes = True