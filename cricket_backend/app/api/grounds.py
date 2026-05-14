from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.ground import Ground
from app.schemas.ground import GroundCreate, GroundResponse

router = APIRouter(prefix="/grounds", tags=["Grounds"])

# ====================== PUBLIC ENDPOINTS ======================

@router.get("/", response_model=List[GroundResponse])
def get_all_grounds(db: Session = Depends(get_db)):
    """Get all cricket grounds in Karachi"""
    grounds = db.query(Ground).all()
    return grounds


@router.get("/{ground_id}", response_model=GroundResponse)
def get_ground_by_id(ground_id: int, db: Session = Depends(get_db)):
    """Get single ground details"""
    ground = db.query(Ground).filter(Ground.id == ground_id).first()
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    return ground


@router.post("/", response_model=GroundResponse)
def create_ground(
    ground_data: GroundCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_admin)  # Uncomment when admin protection needed
):
    """Create new ground (Admin only - protected later)"""
    new_ground = Ground(
        name=ground_data.name,
        location=ground_data.location,
        latitude=ground_data.latitude,
        longitude=ground_data.longitude,
        description=ground_data.description,
        image_url=ground_data.image_url
    )
    
    db.add(new_ground)
    db.commit()
    db.refresh(new_ground)
    return new_ground