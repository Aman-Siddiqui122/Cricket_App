from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class MatchStatCreate(BaseModel):
    player_id: int
    team_id: int
    runs: int = 0
    balls_faced: int = 0
    wickets_taken: int = 0
    overs_bowled: Decimal = Decimal("0.0")
    fours: int = 0
    sixes: int = 0
    is_not_out: bool = False
    innings: int = 1
    dot_balls: int = 0
    wide_balls: int = 0
    no_balls: int = 0

class MatchStatResponse(MatchStatCreate):
    id: int
    match_id: int
    player_name: Optional[str] = None  # Will be populated in service

    class Config:
        from_attributes = True

class MatchSummaryResponse(BaseModel):
    match_id: int
    team1_name: str
    team2_name: Optional[str]
    status: str
    total_runs_team1: int = 0
    total_wickets_team1: int = 0
    total_runs_team2: int = 0
    total_wickets_team2: int = 0
    run_rate_team1: float = 0.0
    strike_rate_top_player: Optional[float] = None