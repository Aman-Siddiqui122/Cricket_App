from app.core.database import SessionLocal
from app.models.ground import Ground

def seed_grounds():
    db = SessionLocal()
    
    grounds = [
        {
            "name": "National Stadium Karachi",
            "location": "Lyari, Karachi",
            "latitude": 24.9008,
            "longitude": 67.0829,
            "description": "Pakistan's iconic international cricket stadium"
        },
        {
            "name": "Southend Club Ground",
            "location": "Clifton, Karachi",
            "latitude": 24.8108,
            "longitude": 67.0305,
            "description": "Popular local cricket ground"
        },
        {
            "name": "PCB Ground",
            "location": "North Nazimabad, Karachi",
            "latitude": 24.9324,
            "longitude": 67.0409
        },
        {
            "name": "KCCA Stadium",
            "location": "Karachi",
            "latitude": 24.8607,
            "longitude": 67.0011
        }
    ]

    for g in grounds:
        if not db.query(Ground).filter(Ground.name == g["name"]).first():
            ground = Ground(**g)
            db.add(ground)
    
    db.commit()
    print("✅ Grounds seeded successfully!")

if __name__ == "__main__":
    seed_grounds()