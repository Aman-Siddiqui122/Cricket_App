from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()

print(f"Total users: {len(users)}")
for user in users:
    print(f"ID: {user.id}, Name: {user.name}, Email: {user.email}, Role: {user.role}")

db.close()
