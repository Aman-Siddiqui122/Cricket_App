from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class MatchCreate(BaseModel):
    ground_id: int
    team1_id: int
    team2_id: Optional[int] = None
    match_date: date
    match_time: time
    overs_per_inning: int = 20

class MatchResponse(BaseModel):
    id: int
    ground_id: int
    team1_id: int
    team2_id: Optional[int]
    match_date: date
    match_time: time
    status: str
    overs_per_inning: int

    class Config:
        from_attributes = True