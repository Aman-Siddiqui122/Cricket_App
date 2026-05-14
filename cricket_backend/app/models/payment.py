from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Enum, String, TIMESTAMP, func
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_method = Column(Enum('jazzcash', 'easypaisa', 'bank', name='payment_method'), nullable=False)
    transaction_id = Column(String(100))
    screenshot_url = Column(String(255))
    status = Column(Enum('pending', 'approved', 'rejected', name='payment_status'), default='pending')
    paid_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())