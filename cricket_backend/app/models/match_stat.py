from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Boolean, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class MatchStat(Base):
    __tablename__ = "match_stats"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)

    # Batting Stats
    runs = Column(Integer, default=0)
    balls_faced = Column(Integer, default=0)
    fours = Column(Integer, default=0)
    sixes = Column(Integer, default=0)
    is_not_out = Column(Boolean, default=False)

    # Bowling Stats
    wickets_taken = Column(Integer, default=0)
    overs_bowled = Column(DECIMAL(4,1), default=0.0)
    dot_balls = Column(Integer, default=0)
    wide_balls = Column(Integer, default=0)
    no_balls = Column(Integer, default=0)

    innings = Column(Integer, default=1)

    match = relationship("Match", back_populates="stats")
    player = relationship("Player")
    team = relationship("Team")