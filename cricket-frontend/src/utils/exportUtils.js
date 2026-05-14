import * as XLSX from 'xlsx';

export const exportMatchToExcel = (match, stats) => {
  // Prepare data for Excel
  const data = stats.map((stat, index) => ({
    "S.No": index + 1,
    "Player Name": stat.player?.name || "Unknown",
    "Team": stat.team?.name || "N/A",
    "Role": stat.player?.role || "-",
    "Runs": stat.runs,
    "Balls Faced": stat.balls_faced,
    "Strike Rate": stat.balls_faced > 0 ? ((stat.runs / stat.balls_faced) * 100).toFixed(2) : 0,
    "Fours": stat.fours,
    "Sixes": stat.sixes,
    "Not Out": stat.is_not_out ? "Yes" : "No",
    "Wickets": stat.wickets_taken,
    "Overs Bowled": stat.overs_bowled,
    "Dot Balls": stat.dot_balls,
    "Wide Balls": stat.wide_balls,
    "No Balls": stat.no_balls,
  }));

  // Add Summary Row
  const totalRuns = stats.reduce((sum, s) => sum + s.runs, 0);
  const totalWickets = stats.reduce((sum, s) => sum + s.wickets_taken, 0);

  data.push({
    "S.No": "",
    "Player Name": "=== MATCH SUMMARY ===",
    "Team": "",
    "Runs": totalRuns,
    "Balls Faced": "",
    "Strike Rate": "",
    "Fours": "",
    "Sixes": "",
    "Wickets": totalWickets,
    "Overs Bowled": "",
  });

  // Create Workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Match Stats");

  // Download File
  const fileName = `Match_${match.id}_${match.team1_name}_vs_${match.team2_name || 'TBD'}.xlsx`;
  XLSX.writeFile(wb, fileName);
};