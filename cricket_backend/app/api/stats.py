from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from app.core.database import get_db
from app.models.match_stat import MatchStat
from app.models.match import Match
from app.models.player import Player
from app.schemas.stats import MatchStatCreate, MatchSummaryResponse

router = APIRouter(prefix="/stats", tags=["Match Statistics"])

def calculate_true_overs(overs_val: float) -> float:
    """Converts cricket overs (e.g. 10.5) to true decimal (10.833)"""
    whole_overs = int(overs_val)
    balls = round((overs_val - whole_overs) * 10)
    return whole_overs + (balls / 6.0)

@router.post("/add")
def add_player_stats(
    stat_data: MatchStatCreate,
    match_id: int,
    db: Session = Depends(get_db)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Save stats
    new_stat = MatchStat(
        match_id=match_id,
        player_id=stat_data.player_id,
        team_id=stat_data.team_id,
        runs=stat_data.runs,
        balls_faced=stat_data.balls_faced,
        wickets_taken=stat_data.wickets_taken,
        overs_bowled=stat_data.overs_bowled,
        fours=stat_data.fours,
        sixes=stat_data.sixes,
        is_not_out=stat_data.is_not_out,
        innings=stat_data.innings,
        dot_balls=stat_data.dot_balls,
        wide_balls=stat_data.wide_balls,
        no_balls=stat_data.no_balls
    )

    db.add(new_stat)
    db.commit()
    db.refresh(new_stat)

    return {"message": "Stats saved successfully", "stat_id": new_stat.id}


@router.get("/match-summary/{match_id}", response_model=MatchSummaryResponse)
def get_match_summary(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    stats = db.query(MatchStat).filter(MatchStat.match_id == match_id).all()

    # Team Stats
    team1_stats = [s for s in stats if s.team_id == match.team1_id]
    team2_stats = [s for s in stats if s.team_id == match.team2_id]

    total_runs_t1 = sum(s.runs for s in team1_stats)
    total_wickets_t1 = sum(s.wickets_taken for s in team1_stats)
    total_runs_t2 = sum(s.runs for s in team2_stats)
    total_wickets_t2 = sum(s.wickets_taken for s in team2_stats)

    # Run Rate Calculation (Team 1)
    true_overs_t1 = sum(calculate_true_overs(float(s.overs_bowled)) for s in team1_stats)
    run_rate_t1 = round(total_runs_t1 / true_overs_t1, 2) if true_overs_t1 > 0 else 0.0

    # Top Player Strike Rate
    all_batters = [s for s in stats if s.balls_faced > 0]
    top_sr = None
    if all_batters:
        top_sr = max((s.runs / s.balls_faced * 100) for s in all_batters)

    return {
        "match_id": match_id,
        "team1_name": match.team1.name,
        "team2_name": match.team2.name if match.team2 else None,
        "total_runs_team1": total_runs_t1,
        "total_wickets_team1": total_wickets_t1,
        "total_runs_team2": total_runs_t2,
        "total_wickets_team2": total_wickets_t2,
        "run_rate_team1": run_rate_t1,
        "status": match.status,
        "strike_rate_top_player": round(top_sr, 2) if top_sr is not None else None
    }