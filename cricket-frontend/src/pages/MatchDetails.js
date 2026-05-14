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
  const [allStats, setAllStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    fetchMatchData();
    setTimeout(() => setPageLoaded(true), 100);
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

      const statsRes = await api.get(`/stats/match-summary/${id}`);
      setAllStats(statsRes.data || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!match) return alert("Match data not loaded yet");
    exportMatchToExcel(match, allStats);
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
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulseGlow { 0%,100% { box-shadow:0 0 5px rgba(74,222,128,0.2); } 50% { box-shadow:0 0 25px rgba(74,222,128,0.5); } }
        @keyframes cardEnter { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes skeleton { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes progressFill { from { width:0%; } to { width:100%; } }
        @keyframes vsPulse { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.2); opacity:1; } }
        @keyframes borderGlow { 0%,100% { border-color:rgba(74,222,128,0.2); } 50% { border-color:rgba(74,222,128,0.5); } }

        .match-page { position:relative; min-height:100vh; overflow:hidden; }
        
        /* Background orbs */
        .match-orb { position:fixed; border-radius:50%; filter:blur(100px); opacity:0.1; pointer-events:none; z-index:0; }
        .match-orb-1 { width:500px; height:500px; background:#4ade80; top:-150px; right:-100px; animation:float 10s ease-in-out infinite; }
        .match-orb-2 { width:400px; height:400px; background:#22c55e; bottom:-100px; left:-100px; animation:float 10s ease-in-out infinite 3s; }

        /* Loading Screen */
        .match-loading-screen {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          min-height:60vh; color:rgba(134,239,172,0.6);
        }
        .match-loading-spinner {
          width:50px; height:50px; border:3px solid rgba(74,222,128,0.2);
          border-top-color:#4ade80; border-radius:50%;
          animation:spin 1s linear infinite; margin-bottom:1.5rem;
          box-shadow:0 0 20px rgba(74,222,128,0.2);
        }

        /* Header */
        .match-header {
          position:relative; z-index:1;
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:2rem; animation:slideUp 0.5s ease-out;
          flex-wrap:wrap; gap:1rem;
        }
        .match-header h2 {
          color:#4ade80; font-size:1.8rem; font-weight:800;
          letter-spacing:-0.5px; text-shadow:0 0 30px rgba(74,222,128,0.2);
          display:flex; align-items:center; gap:0.75rem;
        }

        /* Export Button */
        .match-export-btn {
          display:flex; align-items:center; gap:0.5rem;
          padding:0.6rem 1.25rem; background:rgba(74,222,128,0.15);
          border:1.5px solid rgba(74,222,128,0.3); border-radius:12px;
          color:#4ade80; font-weight:600; font-size:0.9rem;
          cursor:pointer; transition:all 0.3s ease;
          backdrop-filter:blur(10px);
        }
        .match-export-btn:hover {
          background:rgba(74,222,128,0.25); border-color:#4ade80;
          transform:translateY(-2px); box-shadow:0 5px 20px rgba(74,222,128,0.2);
        }

        /* Match Card - Hero */
        .match-hero-card {
          position:relative; z-index:1;
          background:rgba(255,255,255,0.03); backdrop-filter:blur(20px);
          border:1px solid rgba(74,222,128,0.2); border-radius:24px;
          padding:2rem; margin-bottom:2rem;
          box-shadow:0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
          text-align:center; animation:cardEnter 0.6s ease-out;
          overflow:hidden;
        }
        .match-hero-shine {
          position:absolute; top:0; left:-100%; width:50%; height:100%;
          background:rgba(255,255,255,0.03); transform:skewX(-20deg);
          animation:shimmer 3s ease-in-out infinite; pointer-events:none;
        }

        .match-teams {
          display:flex; align-items:center; justify-content:center;
          gap:1.5rem; margin-bottom:1rem; flex-wrap:wrap;
        }
        .match-team-name {
          color:#e8f5e9; font-size:1.5rem; font-weight:800;
          text-shadow:0 0 20px rgba(74,222,128,0.3);
        }
        .match-vs {
          background:rgba(74,222,128,0.2); color:#4ade80;
          padding:0.5rem 1rem; border-radius:50px;
          font-weight:700; font-size:0.9rem;
          animation:vsPulse 2s ease-in-out infinite;
          border:1px solid rgba(74,222,128,0.3);
        }
        .match-meta {
          color:rgba(134,239,172,0.7); font-size:0.95rem;
          display:flex; align-items:center; justify-content:center;
          gap:1.5rem; flex-wrap:wrap;
        }
        .match-meta span {
          display:flex; align-items:center; gap:0.4rem;
        }

        /* Teams Grid */
        .match-teams-grid {
          display:grid; grid-template-columns:1fr 1fr;
          gap:2rem; position:relative; z-index:1;
        }
        @media (max-width:768px) { .match-teams-grid { grid-template-columns:1fr; } }

        /* Team Panel */
        .match-team-panel {
          background:rgba(255,255,255,0.03); backdrop-filter:blur(20px);
          border:1px solid rgba(74,222,128,0.15); border-radius:20px;
          overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.3);
          animation:cardEnter 0.5s ease-out;
        }
        .match-team-panel:nth-child(2) { animation-delay:0.1s; }

        .match-team-header {
          padding:1.25rem 1.5rem; background:rgba(74,222,128,0.08);
          border-bottom:1px solid rgba(74,222,128,0.15);
          display:flex; align-items:center; justify-content:space-between;
        }
        .match-team-header h5 {
          color:#4ade80; font-weight:700; font-size:1rem;
          display:flex; align-items:center; gap:0.5rem;
        }
        .match-team-count {
          background:rgba(74,222,128,0.15); color:#4ade80;
          padding:0.25rem 0.75rem; border-radius:20px;
          font-size:0.8rem; font-weight:600;
        }

        /* Player List */
        .match-player-list { padding:0.5rem; }
        .match-player-item {
          display:flex; align-items:center; justify-content:space-between;
          padding:1rem; border-radius:12px;
          transition:all 0.3s ease; border:1.5px solid transparent;
        }
        .match-player-item:hover {
          background:rgba(74,222,128,0.08);
          border-color:rgba(74,222,128,0.2);
          transform:translateX(5px);
        }
        .match-player-info { display:flex; align-items:center; gap:1rem; }
        .match-player-avatar {
          width:40px; height:40px; border-radius:50%;
          background:rgba(74,222,128,0.15);
          display:flex; align-items:center; justify-content:center;
          font-size:1.25rem; flex-shrink:0;
        }
        .match-player-name {
          color:#e8f5e9; font-weight:600; font-size:0.95rem;
        }
        .match-player-role {
          color:rgba(134,239,172,0.5); font-size:0.8rem;
          text-transform:uppercase; letter-spacing:0.05em;
        }

        .match-stats-btn {
          padding:0.5rem 1rem; background:rgba(59,130,246,0.15);
          border:1px solid rgba(59,130,246,0.3); border-radius:10px;
          color:#60a5fa; font-size:0.8rem; font-weight:600;
          cursor:pointer; transition:all 0.3s ease;
          display:flex; align-items:center; gap:0.4rem;
        }
        .match-stats-btn:hover {
          background:rgba(59,130,246,0.25);
          transform:translateY(-2px);
          box-shadow:0 4px 12px rgba(59,130,246,0.2);
        }

        /* Empty State */
        .match-empty {
          text-align:center; padding:2rem; color:rgba(134,239,172,0.4);
        }
        .match-empty-icon { font-size:2rem; margin-bottom:0.5rem; opacity:0.5; }

        /* Skeleton */
        .match-skeleton {
          height:60px; background:rgba(255,255,255,0.03); border-radius:12px;
          background-image:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 100%);
          background-size:200% 100%; animation:skeleton 1.5s ease-in-out infinite;
          margin-bottom:0.5rem;
        }

        /* Progress bar for team fill */
        .match-team-fill {
          width:100%; height:4px; background:rgba(74,222,128,0.1);
          border-radius:2px; overflow:hidden; margin-top:0.5rem;
        }
        .match-team-fill-bar {
          height:100%; background:#4ade80; border-radius:2px;
          transition:width 0.5s ease;
          box-shadow:0 0 10px rgba(74,222,128,0.3);
        }
      `}</style>

      <div className="match-page">
        <div className="match-orb match-orb-1"></div>
        <div className="match-orb match-orb-2"></div>

        <div className="match-header">
          <h2>🏏 Match Details #{id}</h2>
          <button className="match-export-btn" onClick={handleExport}>
            <span>📊</span> Download Excel Report
          </button>
        </div>

        {match && (
          <div className="match-hero-card">
            <div className="match-hero-shine"></div>
            <div className="match-teams">
              <span className="match-team-name">{match.team1_name}</span>
              <span className="match-vs">VS</span>
              <span className="match-team-name">{match.team2_name || "TBD"}</span>
            </div>
            <div className="match-meta">
              <span>🏟️ {match.ground_name}</span>
              <span>📅 {match.match_date}</span>
              <span>🕒 {match.match_time}</span>
            </div>
          </div>
        )}

        <div className="match-teams-grid">
          <div className="match-team-panel">
            <div className="match-team-header">
              <h5>👕 {match?.team1_name}</h5>
              <span className="match-team-count">{team1Players.length}/20</span>
            </div>
            <div className="match-team-fill">
              <div 
                className="match-team-fill-bar" 
                style={{ width: `${(team1Players.length / 20) * 100}%` }}
              ></div>
            </div>
            <div className="match-player-list">
              {team1Players.length === 0 ? (
                <div className="match-empty">
                  <div className="match-empty-icon">👤</div>
                  <p>No players have joined yet.</p>
                </div>
              ) : (
                team1Players.map(player => (
                  <div className="match-player-item" key={player.id}>
                    <div className="match-player-info">
                      <div className="match-player-avatar">
                        {player.role === 'bowler' ? '🎯' : player.role === 'allrounder' ? '⭐' : '🏏'}
                      </div>
                      <div>
                        <div className="match-player-name">{player.name}</div>
                        <div className="match-player-role">{player.role || '—'}</div>
                      </div>
                    </div>
                    <button 
                      className="match-stats-btn"
                      onClick={() => setSelectedPlayer({...player, teamId: match?.team1_id})}
                    >
                      <span>📈</span> Add Stats
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="match-team-panel">
            <div className="match-team-header">
              <h5>👕 {match?.team2_name}</h5>
              <span className="match-team-count">{team2Players.length}/20</span>
            </div>
            <div className="match-team-fill">
              <div 
                className="match-team-fill-bar" 
                style={{ width: `${(team2Players.length / 20) * 100}%` }}
              ></div>
            </div>
            <div className="match-player-list">
              {team2Players.length === 0 ? (
                <div className="match-empty">
                  <div className="match-empty-icon">👤</div>
                  <p>No players have joined yet.</p>
                </div>
              ) : (
                team2Players.map(player => (
                  <div className="match-player-item" key={player.id}>
                    <div className="match-player-info">
                      <div className="match-player-avatar">
                        {player.role === 'bowler' ? '🎯' : player.role === 'allrounder' ? '⭐' : '🏏'}
                      </div>
                      <div>
                        <div className="match-player-name">{player.name}</div>
                        <div className="match-player-role">{player.role || '—'}</div>
                      </div>
                    </div>
                    <button 
                      className="match-stats-btn"
                      onClick={() => setSelectedPlayer({...player, teamId: match?.team2_id})}
                    >
                      <span>📈</span> Add Stats
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {selectedPlayer && (
          <StatsModal 
            player={selectedPlayer} 
            matchId={id} 
            teamId={selectedPlayer.teamId}
            onClose={() => setSelectedPlayer(null)} 
            refreshData={fetchMatchData}
          />
        )}
      </div>
    </>
  );
};

export default MatchDetails;