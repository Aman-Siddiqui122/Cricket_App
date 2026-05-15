import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { exportMatchToExcel } from '../utils/exportUtils';
import StatsModal from '../components/StatsModal';

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [matchSummary, setMatchSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    fetchMatchData();
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [id]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const matchRes = await api.get(`/matches/${id}`);
      setMatch(matchRes.data);

      if (matchRes.data.team1_id) {
        const t1 = await api.get(`/teams/${matchRes.data.team1_id}/players`);
        setTeam1Players(t1.data);
      }
      if (matchRes.data.team2_id) {
        const t2 = await api.get(`/teams/${matchRes.data.team2_id}/players`);
        setTeam2Players(t2.data);
      }

      const summaryRes = await api.get(`/stats/match-summary/${id}`);
      setMatchSummary(summaryRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!match) return alert("Match data not loaded yet");
    exportMatchToExcel(match, matchSummary);
  };

  if (loading) return (
    <div className="match-loading-screen">
      <div className="match-loading-spinner"></div>
      <p>Loading Match Details...</p>
    </div>
  );

  return (
    <>
      <style>{`
        /* ... existing animations ... */
        .match-score-card {
          background: var(--cricket-navy, #1a2332);
          color: white;
          padding: 1.5rem;
          border-radius: 14px;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-around;
          align-items: center;
          text-align: center;
          animation: cardEnter 0.5s ease-out;
        }
        .match-score-team h4 { margin: 0 0 0.5rem; color: var(--cricket-gold, #c9a84c); font-size: 1rem; }
        .match-score-value { font-size: 2rem; font-weight: 800; }
        .match-score-meta { font-size: 0.8rem; opacity: 0.8; margin-top: 0.5rem; }
        .match-summary-banner {
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid var(--cricket-gold, #c9a84c);
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
        }
        /* ... existing styles ... */
      `}</style>

      <div className="match-page">
        <div className="match-header">
          <h2>🏏 Match Details #{id}</h2>
          <button className="match-export-btn" onClick={handleExport}>
            <span>📊</span> Download Excel Report
          </button>
        </div>

        {match && (
          <div className="match-hero-card">
            <div className="match-teams">
              <span className="match-team-name">{match.team1_name}</span>
              <span className="match-vs">VS</span>
              <span className="match-team-name">{match.team2_name || "TBD"}</span>
            </div>
            <div className="match-meta">
              <span>🏟️ {match.ground_name}</span>
              <span>📅 {match.match_date}</span>
              <span>⏰ {match.match_time}</span>
            </div>
          </div>
        )}

        {matchSummary && (
          <>
            <div className="match-score-card">
              <div className="match-score-team">
                <h4>{matchSummary.team1_name}</h4>
                <div className="match-score-value">{matchSummary.total_runs_team1}/{matchSummary.total_wickets_team1}</div>
                <div className="match-score-meta">Run Rate: {matchSummary.run_rate_team1}</div>
              </div>
              <div style={{ fontSize: '1.5rem', opacity: 0.3 }}>|</div>
              <div className="match-score-team">
                <h4>{matchSummary.team2_name || 'Opponent'}</h4>
                <div className="match-score-value">{matchSummary.total_runs_team2}/{matchSummary.total_wickets_team2}</div>
                <div className="match-score-meta">Match Status: {matchSummary.status?.toUpperCase()}</div>
              </div>
            </div>

            {matchSummary.strike_rate_top_player && (
              <div className="match-summary-banner">
                <span>🔥 Top Performer Strike Rate: <strong>{matchSummary.strike_rate_top_player}</strong></span>
                <span className={`match-status-badge admin-status-${matchSummary.status?.toLowerCase()}`}>
                  {matchSummary.status?.toUpperCase()}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};