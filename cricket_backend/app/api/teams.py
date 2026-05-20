from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta

from app.core.database import get_db
from app.models.team import Team
from app.models.user import User
from app.models.player import Player

from app.schemas.team import TeamCreate, TeamResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/teams", tags=["Teams"])


# Get All Teams (for Join Team Page)
@router.get("/", response_model=List[TeamResponse])
def get_all_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()


# Get My Teams
@router.get("/my-teams", response_model=List[TeamResponse])
def get_my_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teams = db.query(Team).filter(Team.admin_id == current_user.id).all()
    return teams
# Get teams where user is a PLAYER
@router.get("/joined")
def get_joined_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teams = db.query(Team).join(Player).filter(Player.name == current_user.name).all()
    return teams


# Create Team
@router.post("/", response_model=TeamResponse, status_code=201)
def create_team(team_data: TeamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Team).filter(Team.name == team_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already exists")

    new_team = Team(
        name=team_data.name,
        admin_id=current_user.id,
        contact_number=getattr(team_data, 'contact_number', None),
        jazzcash_number=getattr(team_data, 'jazzcash_number', None),
        home_ground_id=getattr(team_data, 'home_ground_id', None),
        subscription_status='trial',
        subscription_start=date.today(),
        subscription_end=date.today() + timedelta(days=90)
    )

    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team


# ====================== JOIN TEAM (ADD PLAYER) ======================
@router.post("/{team_id}/add-player")
def add_player_to_team(
    team_id: int,
    player_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Max 20 players check
    if db.query(Player).filter(Player.team_id == team_id).count() >= 20:
        raise HTTPException(status_code=400, detail="Maximum 20 players allowed in a team")

    new_player = Player(
        name=player_data.get("name"),
        phone=player_data.get("phone"),
        role=player_data.get("role", "batsman"),
        team_id=team_id
    )

    db.add(new_player)
    db.commit()
    db.refresh(new_player)

    return {"message": "Successfully joined the team!", "player": new_player}