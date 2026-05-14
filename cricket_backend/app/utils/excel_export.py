from fastapi import HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from app.models.match import Match
from app.models.match_stat import MatchStat

def export_match_to_excel(match_id: int, db: Session):
    """Generate detailed Excel report for a match"""
    
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Get all stats
    stats = db.query(MatchStat).filter(MatchStat.match_id == match_id).all()

    data = []
    for stat in stats:
        player_name = stat.player.name if stat.player else "Unknown"
        team_name = stat.team.name if stat.team else "Unknown"
        
        strike_rate = round((stat.runs / stat.balls_faced * 100), 2) if stat.balls_faced > 0 else 0
        run_rate_contribution = round(stat.runs / (stat.overs_bowled or 1), 2) if stat.overs_bowled > 0 else 0

        data.append({
            "Player Name": player_name,
            "Team": team_name,
            "Runs": stat.runs,
            "Balls Faced": stat.balls_faced,
            "Strike Rate": strike_rate,
            "Fours": stat.fours,
            "Sixes": stat.sixes,
            "Not Out": stat.is_not_out,
            "Wickets Taken": stat.wickets_taken,
            "Overs Bowled": float(stat.overs_bowled),
            "Innings": stat.innings
        })

    # Create DataFrame
    df = pd.DataFrame(data)

    # Add summary row
    summary = {
        "Player Name": "=== MATCH SUMMARY ===",
        "Team": "",
        "Runs": df["Runs"].sum(),
        "Balls Faced": df["Balls Faced"].sum(),
        "Strike Rate": "",
        "Fours": df["Fours"].sum(),
        "Sixes": df["Sixes"].sum(),
        "Not Out": "",
        "Wickets Taken": df["Wickets Taken"].sum(),
        "Overs Bowled": df["Overs Bowled"].sum(),
        "Innings": ""
    }
    df = pd.concat([df, pd.DataFrame([summary])], ignore_index=True)

    # Generate filename
    filename = f"Match_{match_id}_{match.team1.name}_vs_{match.team2.name if match.team2 else 'TBD'}_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    
    # Save to Excel with formatting
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Match Stats")
        
        # Auto-adjust column widths
        worksheet = writer.sheets["Match Stats"]
        for i, col in enumerate(df.columns):
            max_length = max(df[col].astype(str).map(len).max(), len(col)) + 2
            worksheet.column_dimensions[chr(65 + i)].width = max_length

    return filename