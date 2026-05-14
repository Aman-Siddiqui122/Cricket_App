from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    phone = Column(String(20))
    role = Column(Enum('batsman', 'bowler', 'allrounder', name='player_role'), default='batsman')
    
    team = relationship("Team", back_populates="players")