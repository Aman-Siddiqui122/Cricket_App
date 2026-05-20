from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.models.match import Match
from app.models.team import Team
from app.models.ground import Ground
from app.models.user import User

from app.schemas.match import MatchCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/matches", tags=["Matches"])


# ====================== PUBLIC ENDPOINTS ======================
@router.get("/")
def get_all_matches(db: Session = Depends(get_db)):
    matches = db.query(Match).order_by(Match.match_date.desc(), Match.match_time).all()
    return matches


@router.get("/{match_id}")
def get_match_details(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


# ====================== CREATE MATCH ======================
@router.post("/", status_code=201)
def create_match(
    match_data: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new match - Team Admin or Super Admin"""

    # Check Team 1 exists and user is admin of it
    team1 = db.query(Team).filter(Team.id == match_data.team1_id).first()
    if not team1:
        raise HTTPException(status_code=404, detail="Team 1 not found")

    if team1.admin_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(
            status_code=403, 
            detail="You can only create matches for your own team"
        )

    # Check Team 2 (if provided)
    if match_data.team2_id:
        team2 = db.query(Team).filter(Team.id == match_data.team2_id).first()
        if not team2:
            raise HTTPException(status_code=404, detail="Team 2 not found")

    # Check Ground exists
    ground = db.query(Ground).filter(Ground.id == match_data.ground_id).first()
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")

    new_match = Match(
        ground_id=match_data.ground_id,
        team1_id=match_data.team1_id,
        team2_id=match_data.team2_id,
        match_date=match_data.match_date,
        match_time=match_data.match_time,
        overs_per_inning=match_data.overs_per_inning or 20,
        status="upcoming",
        created_by=current_user.id
    )

    db.add(new_match)
    db.commit()
    db.refresh(new_match)

    return {
        "message": "Match created successfully!",
        "match_id": new_match.id,
        "match": new_match
    }