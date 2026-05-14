from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import date, timedelta
from app.core.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    home_ground_id = Column(Integer, ForeignKey("grounds.id"), nullable=True)   # ← New
    
    contact_number = Column(String(20))
    jazzcash_number = Column(String(20))
    
    subscription_status = Column(Enum('trial', 'active', 'inactive', 'expired', name='subscription_status'), default='trial')
    subscription_start = Column(Date, default=date.today)
    subscription_end = Column(Date, nullable=True)

    admin = relationship("User", back_populates="teams_admin")
    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")
    home_ground = relationship("Ground")   # ← New

    def set_trial(self):
        self.subscription_status = 'trial'
        self.subscription_end = date.today() + timedelta(days=90)  # 3 months free