from sqlalchemy import Column, Integer, String, Text, DECIMAL
from app.core.database import Base

class Ground(Base):
    __tablename__ = "grounds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(Text, nullable=False)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    city = Column(String(50), default="Karachi")
    description = Column(Text)
    image_url = Column(String(255))