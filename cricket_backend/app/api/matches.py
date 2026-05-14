from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.models.match import Match
from app.models.team import Team
from app.models.ground import Ground
from app.schemas.match import MatchCreate, MatchResponse
from app.dependencies import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/matches", tags=["Matches"])

# ====================== PUBLIC ENDPOINTS ======================

@router.get("/")
def get_all_matches(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    date_filter: Optional[date] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all matches with optional filters"""
    query = db.query(Match)

    if status:
        query = query.filter(Match.status == status)
    if date_filter:
        query = query.filter(Match.match_date == date_filter)

    matches = query.order_by(Match.match_date, Match.match_time).offset(skip).limit(limit).all()

    # Enrich response with names
    result = []
    for m in matches:
        result.append({
            "id": m.id,
            "ground_name": m.ground.name if m.ground else None,
            "team1_name": m.team1.name if m.team1 else None,
            "team2_name": m.team2.name if m.team2 else None,
            "match_date": m.match_date,
            "match_time": m.match_time,
            "status": m.status,
            "overs_per_inning": m.overs_per_inning
        })
    return result


@router.get("/{match_id}")
def get_match_details(match_id: int, db: Session = Depends(get_db)):
    """Get detailed match information"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return {
        "id": match.id,
        "ground_id": match.ground_id,
        "ground_name": match.ground.name if match.ground else None,
        "team1_id": match.team1_id,
        "team1_name": match.team1.name if match.team1 else None,
        "team2_id": match.team2_id,
        "team2_name": match.team2.name if match.team2 else None,
        "match_date": match.match_date,
        "match_time": match.match_time,
        "status": match.status,
        "overs_per_inning": match.overs_per_inning
    }


# ====================== ADMIN / TEAM ADMIN ENDPOINTS ======================

@router.post("/", response_model=dict, status_code=201)
def create_match(
    match_data: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new match (Team Admin or Super Admin)"""
    
    # Basic permission check
    if current_user.role == 'team_admin':
        # Team admin can only create matches for their own team
        team = db.query(Team).filter(Team.admin_id == current_user.id).first()
        if not team or team.id != match_data.team1_id:
            raise HTTPException(status_code=403, detail="Not authorized to create match for this team")
    elif current_user.role != 'admin':
        # Only admin or team_admin can create matches
        raise HTTPException(status_code=403, detail="Not authorized to create matches")

    # Validate teams exist
    team1 = db.query(Team).filter(Team.id == match_data.team1_id).first()
    if not team1:
        raise HTTPException(status_code=404, detail="Team 1 not found")

    if match_data.team2_id:
        team2 = db.query(Team).filter(Team.id == match_data.team2_id).first()
        if not team2:
            raise HTTPException(status_code=404, detail="Team 2 not found")

    new_match = Match(
        ground_id=match_data.ground_id,
        team1_id=match_data.team1_id,
        team2_id=match_data.team2_id,
        match_date=match_data.match_date,
        match_time=match_data.match_time,
        overs_per_inning=match_data.overs_per_inning,
        created_by=current_user.id
    )

    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    
    # Return a serializable dict instead of ORM object
    return {
        "message": "Match created successfully",
        "match_id": new_match.id,
        "match": {
            "id": new_match.id,
            "ground_id": new_match.ground_id,
            "team1_id": new_match.team1_id,
            "team2_id": new_match.team2_id,
            "match_date": new_match.match_date,
            "match_time": new_match.match_time,
            "status": new_match.status,
            "overs_per_inning": new_match.overs_per_inning,
            "created_by": new_match.created_by
        }
    }