from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, timedelta
from app.core.database import get_db
from app.models.payment import Payment
from app.models.team import Team
from app.schemas.team import TeamResponse
from app.dependencies import get_current_user

from app.schemas.payment import PaymentResponse

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/subscribe/{team_id}")
async def submit_subscription_payment(
    team_id: int,
    amount: float = 500.0,
    transaction_id: Optional[str] = None,
    screenshot: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Team admin submits payment proof for monthly subscription"""
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only team admin can pay for this team")

    # Save screenshot if uploaded
    screenshot_url = None
    if screenshot:
        # In production: Upload to AWS S3 or local storage
        screenshot_url = f"uploads/{screenshot.filename}"  
        # For now we just record the filename
        content = await screenshot.read()
        # You can save file here if needed

    new_payment = Payment(
        team_id=team_id,
        amount=amount,
        payment_method="jazzcash",
        transaction_id=transaction_id,
        screenshot_url=screenshot_url,
        paid_by=current_user.id,
        status="pending"
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return {
        "message": "Payment submitted successfully. Waiting for admin approval.",
        "payment_id": new_payment.id,
        "team_id": team_id,
        "amount": amount,
        "status": "pending"
    }


@router.get("/my-payments", response_model=list[PaymentResponse])
def get_my_payments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all payments made by current user's team"""
    payments = db.query(Payment).join(Team).filter(Team.admin_id == current_user.id).all()
    return payments


@router.post("/verify/{payment_id}", response_model=dict)
def verify_payment(
    payment_id: int,
    status: str,   # "approved" or "rejected"
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Super Admin verifies payment and activates subscription"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only super admin can verify payments")

    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'approved' or 'rejected'")

    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.status = status

    if status == "approved":
        team = db.query(Team).filter(Team.id == payment.team_id).first()
        if team:
            team.subscription_status = 'active'
            team.subscription_end = date.today() + timedelta(days=30)
            db.add(team)

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {"message": f"Payment {status} successfully", "payment_id": payment.id, "status": payment.status}