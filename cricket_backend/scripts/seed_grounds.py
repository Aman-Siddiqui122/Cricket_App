from app.core.database import SessionLocal
from app.models.ground import Ground

def seed_grounds():
    db = SessionLocal()
    
    grounds = [
        { "name": "National Stadium", "location": "Gulshan-e-Iqbal", "latitude": 24.8964, "longitude": 67.0556 },
        { "name": "Asghar Ali Shah Stadium", "location": "Federal B Area", "latitude": 24.9180, "longitude": 67.0631 },
        { "name": "KPT Sports Complex", "location": "Clifton", "latitude": 24.8138, "longitude": 67.0305 },
        { "name": "Southend Club Cricket Stadium", "location": "Defence Housing Authority", "latitude": 24.7936, "longitude": 67.0583 },
        { "name": "A.O. Cricket Stadium", "location": "Gulshan-e-Iqbal", "latitude": 24.9056, "longitude": 67.0822 },
        { "name": "Karachi Gymkhana", "location": "Saddar", "latitude": 24.8484, "longitude": 67.0344 },
        { "name": "Naya Nazimabad Cricket Ground", "location": "Naya Nazimabad", "latitude": 24.9372, "longitude": 66.9756 },
        { "name": "TMC Ground", "location": "Korangi", "latitude": 24.8395, "longitude": 67.1328 },
        { "name": "Landhi Gymkhana", "location": "Landhi", "latitude": 24.8206, "longitude": 67.1854 },
        { "name": "KCCA Ground", "location": "Karachi Club", "latitude": 24.8607, "longitude": 67.0011 }
    ]

    for g in grounds:
        existing = db.query(Ground).filter(Ground.name == g["name"]).first()
        if not existing:
            ground = Ground(**g)
            db.add(ground)
            print(f"Adding ground: {g['name']}")
        else:
            print(f"Ground already exists: {g['name']}")
    
    db.commit()
    db.close()
    print("✅ Grounds seeded successfully!")

if __name__ == "__main__":
    seed_grounds()