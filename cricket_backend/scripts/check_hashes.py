from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()

for user in users:
    print(f"Email: {user.email}, Hash: {user.password_hash[:10]}...")

db.close()
