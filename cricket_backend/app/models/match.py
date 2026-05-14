from sqlalchemy import Column, Integer, ForeignKey, Date, Time, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    ground_id = Column(Integer, ForeignKey("grounds.id"), nullable=False)
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    match_date = Column(Date, nullable=False, index=True)
    match_time = Column(Time, nullable=False)
    status = Column(Enum('upcoming', 'ongoing', 'completed', 'cancelled', name='match_status'), default='upcoming')
    overs_per_inning = Column(Integer, default=20)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    ground = relationship("Ground")
    team1 = relationship("Team", foreign_keys=[team1_id])
    team2 = relationship("Team", foreign_keys=[team2_id])
    stats = relationship("MatchStat", back_populates="match")