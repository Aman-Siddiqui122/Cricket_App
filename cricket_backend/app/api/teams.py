from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.core.database import get_db
from app.models.team import Team
from app.models.user import User
from app.models.player import Player
from app.schemas.team import TeamCreate, TeamResponse
from app.dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/teams", tags=["Teams"])

# ====================== PUBLIC / USER ENDPOINTS ======================

from app.schemas.team import TeamCreate   # Update schema too later

@router.post("/", response_model=TeamResponse, status_code=201)
def create_team(
    team_data: dict,   # We'll update schema later
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Allow multiple teams per admin
    new_team = Team(
        name=team_data["name"],
        admin_id=current_user.id,
        contact_number=team_data.get("contact_number"),
        jazzcash_number=team_data.get("jazzcash_number"),
        home_ground_id=team_data.get("home_ground_id"),   # ← Important
        subscription_status='trial',
        subscription_start=date.today(),
        subscription_end=date.today() + timedelta(days=90)
    )
    
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    
    return new_team

@router.post("/{team_id}/add-player")
def add_player_to_team(
    team_id: int,
    player_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Allow if user is team admin OR if it's a trial/public team (anyone can join)
    # For now, let's allow anyone to join a team if they are logged in
    # but restrict manual "Add Player" in MyTeam UI to the admin.
    
    # Check max 20 players
    player_count = db.query(Player).filter(Player.team_id == team_id).count()
    if player_count >= 20:
        raise HTTPException(status_code=400, detail="Maximum 20 players allowed per team")

    new_player = Player(
        name=player_data["name"],
        team_id=team_id,
        phone=player_data.get("phone"),
        role=player_data.get("role", "batsman")
    )
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    return new_player


@router.get("/{team_id}/players")
def get_team_players(team_id: int, db: Session = Depends(get_db)):
    players = db.query(Player).filter(Player.team_id == team_id).all()
    return players

@router.get("/my-team", response_model=TeamResponse)
def get_my_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get team where current user is admin"""
    team = db.query(Team).filter(Team.admin_id == current_user.id).first()
    if not team:
        raise HTTPException(status_code=404, detail="You don't have any team yet")
    
    # Add players count
    team.players_count = db.query(Player).filter(Player.team_id == team.id).count()
    return team


@router.get("/", response_model=List[TeamResponse])
def get_all_teams(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get all active/trial teams"""
    teams = db.query(Team).offset(skip).limit(limit).all()
    for team in teams:
        team.players_count = db.query(Player).filter(Player.team_id == team.id).count()
    return teams


# ====================== ADMIN / SUBSCRIPTION ======================

@router.post("/{team_id}/subscribe")
def subscribe_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subscribe team for 30 days (₹250/month)"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only team admin can subscribe")

    team.subscription_status = 'active'
    team.subscription_end = date.today() + timedelta(days=30)
    
    db.commit()
    db.refresh(team)
    
    return {
        "message": "Subscription activated successfully (₹250/month)",
        "team": TeamResponse.from_orm(team)
    }