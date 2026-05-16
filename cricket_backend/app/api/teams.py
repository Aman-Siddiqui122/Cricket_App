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

router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)


# =========================================================
# GET MY TEAMS
# =========================================================

@router.get(
    "/my-team",
    response_model=List[TeamResponse]
)
def get_my_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all teams owned by current user
    """

    teams = db.query(Team).filter(
        Team.admin_id == current_user.id
    ).all()

    if not teams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You don't have any team yet"
        )

    for team in teams:
        team.players_count = db.query(Player).filter(
            Player.team_id == team.id
        ).count()

    return teams


# =========================================================
# GET ALL TEAMS
# =========================================================

@router.get(
    "/",
    response_model=List[TeamResponse]
)
def get_all_teams(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """
    Get all teams
    """

    teams = (
        db.query(Team)
        .offset(skip)
        .limit(limit)
        .all()
    )

    for team in teams:
        team.players_count = db.query(Player).filter(
            Player.team_id == team.id
        ).count()

    return teams


# =========================================================
# CREATE TEAM
# =========================================================

@router.post(
    "/",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED
)
def create_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create new cricket team
    """

    # Check duplicate team name
    existing_team = db.query(Team).filter(
        Team.name == team_data.name
    ).first()

    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already exists"
        )

    new_team = Team(
        name=team_data.name,
        admin_id=current_user.id,
        contact_number=team_data.contact_number,
        jazzcash_number=team_data.jazzcash_number,
        home_ground_id=team_data.home_ground_id,

        subscription_status="trial",
        subscription_start=date.today(),
        subscription_end=date.today() + timedelta(days=90)
    )

    # Upgrade user role
    current_user.role = "team_admin"

    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    # Add player count
    new_team.players_count = 0

    return new_team


# =========================================================
# GET TEAM PLAYERS
# =========================================================

@router.get("/{team_id}/players")
def get_team_players(
    team_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all players of a team
    """

    team = db.query(Team).filter(
        Team.id == team_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    players = db.query(Player).filter(
        Player.team_id == team_id
    ).all()

    return players


# =========================================================
# ADD PLAYER
# =========================================================

@router.post("/{team_id}/add-player")
def add_player_to_team(
    team_id: int,
    player_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add player to team
    """

    team = db.query(Team).filter(
        Team.id == team_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Only team owner can add players
    if team.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admin can add players"
        )

    # Player limit
    player_count = db.query(Player).filter(
        Player.team_id == team_id
    ).count()

    if player_count >= 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 20 players allowed"
        )

    # Validate player name
    if not player_data.get("name"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Player name is required"
        )

    new_player = Player(
        name=player_data.get("name"),
        phone=player_data.get("phone"),
        role=player_data.get("role", "batsman"),
        team_id=team_id
    )

    db.add(new_player)
    db.commit()
    db.refresh(new_player)

    return {
        "message": "Player added successfully",
        "player": new_player
    }


# =========================================================
# SUBSCRIBE TEAM
# =========================================================

@router.post("/{team_id}/subscribe")
def subscribe_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Activate team subscription
    """

    team = db.query(Team).filter(
        Team.id == team_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Owner check
    if team.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admin can subscribe"
        )

    team.subscription_status = "active"

    # Extend subscription
    if team.subscription_end and team.subscription_end > date.today():
        team.subscription_end = (
            team.subscription_end + timedelta(days=30)
        )
    else:
        team.subscription_end = (
            date.today() + timedelta(days=30)
        )

    db.commit()
    db.refresh(team)

    team.players_count = db.query(Player).filter(
        Player.team_id == team.id
    ).count()

    return {
        "message": "Subscription activated successfully",
        "team": team
    }


# =========================================================
# DELETE TEAM
# =========================================================

@router.delete("/{team_id}")
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete team
    """

    team = db.query(Team).filter(
        Team.id == team_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    if team.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owner can delete team"
        )

    # Delete players first
    db.query(Player).filter(
        Player.team_id == team.id
    ).delete()

    db.delete(team)

    db.commit()

    return {
        "message": "Team deleted successfully"
    }