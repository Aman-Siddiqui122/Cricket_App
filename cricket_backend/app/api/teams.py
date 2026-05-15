from fastapi import APIRouter, Depends, HTTPException, status, Body
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

# ⚠️ IMPORTANT: Fixed routes must come BEFORE /{team_id} routes.
# FastAPI matches routes top-to-bottom. If /{team_id} is defined first,
# it will capture "my-team" as team_id and never reach /my-team.

@router.get("/my-team", response_model=TeamResponse)
def get_my_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get team where current user is admin"""
    team = db.query(Team).filter(Team.admin_id == current_user.id).first()
    if not team:
        raise HTTPException(status_code=404, detail="You don't have any team yet")

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


@router.post("/", response_model=TeamResponse, status_code=201)
def create_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user already has a team
    existing_team = db.query(Team).filter(Team.admin_id == current_user.id).first()
    if existing_team:
        raise HTTPException(status_code=400, detail="You already have a team registered")

    new_team = Team(
        name=team_data.name,
        admin_id=current_user.id,
        contact_number=team_data.contact_number,
        jazzcash_number=team_data.jazzcash_number,
        subscription_status='trial',
        subscription_start=date.today(),
        subscription_end=date.today() + timedelta(days=90)
    )
    
    # Upgrade user role to team_admin
    current_user.role = 'team_admin'
    
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team


# ── Routes with {team_id} path param come AFTER all fixed-path routes ──

@router.get("/{team_id}/players")
def get_team_players(team_id: int, db: Session = Depends(get_db)):
    players = db.query(Player).filter(Player.team_id == team_id).all()
    return players


@router.post("/{team_id}/add-player")
def add_player_to_team(
    team_id: int,
    player_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

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


# ====================== ADMIN / SUBSCRIPTION ======================

@router.post("/{team_id}/subscribe")
def subscribe_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subscribe team for 30 days (250 PKR/month)"""
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
        "message": "Subscription activated successfully (250 PKR/month)",
        "team": TeamResponse.from_orm(team)
    }
print('code witten by Aman Siddiqui')
