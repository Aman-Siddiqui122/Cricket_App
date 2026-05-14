from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class GroundBase(BaseModel):
    name: str
    location: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class GroundCreate(GroundBase):
    pass

class GroundResponse(GroundBase):
    id: int
    city: str

    class Config:
        from_attributes = True