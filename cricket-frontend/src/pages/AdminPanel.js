import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaPlus } from 'react-icons/fa';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [matches, setMatches] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [matchForm, setMatchForm] = useState({
    ground_id: '',
    team1_id: '',
    team2_id: '',
    match_date: '',
    match_time: ''
  });

  useEffect(() => {
    fetchInitialData();
    setTimeout(() => setPageLoaded(true), 50);
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [groundsRes, myTeamsRes, allTeamsRes] = await Promise.all([
        api.get('/grounds/'),
        api.get('/teams/my-teams'),
        api.get('/teams/')
      ]);

      setGrounds(groundsRes.data || []);
      setMyTeams(myTeamsRes.data || []);
      setAllTeams(allTeamsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches/');
      setMatches(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setMatchForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  const createMatch = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setErrorMsg('');

    try {
      await api.post('/matches/', {
        ...matchForm,
        ground_id: parseInt(matchForm.ground_id),
        team1_id: parseInt(matchForm.team1_id),
        team2_id: matchForm.team2_id ? parseInt(matchForm.team2_id) : null,
        overs_per_inning: 20
      });

      setSubmitStatus('success');
      setMatchForm({ ground_id: '', team1_id: '', team2_id: '', match_date: '', match_time: '' });
      setTimeout(() => setSubmitStatus('idle'), 2000);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMsg(err.response?.data?.detail || "Failed to create match. Please try again.");
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const tabSwitch = useCallback((tab) => {
    setPageLoaded(false);
    setActiveTab(tab);
    setTimeout(() => setPageLoaded(true), 50);
    if (tab === 'matches') fetchMatches();
  }, []);

  const inputIcon = (field) => {
    const icons = {
      ground_id: '🏟️', team1_id: '👕', team2_id: '👕',
      match_date: '📅', match_time: '⏰'
    };
    return icons[field] || '•';
  };

  const getStatusBadgeClass = (status) => {
    const normalized = status?.toLowerCase() || 'scheduled';
    return `admin-status-${normalized}`;
  };

  if (loading && !pageLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #ddd', borderTop: '4px solid #1a2332', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes successPop {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes skeleton {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .admin-page {
          position: relative;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        .admin-header {
          position: relative;
          z-index: 1;
          margin-bottom: 1.5rem;
          animation: slideUp 0.45s ease-out;
        }

        .admin-header h2 {
          color: #1a2332;
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin: 0 0 0.375rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .admin-tabs {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #d4cec4;
          padding-bottom: 1px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .admin-tabs::-webkit-scrollbar {
          display: none;
        }

        .admin-tab {
          padding: 0.625rem 1.25rem;
          background: transparent;
          border: none;
          border-radius: 10px 10px 0 0;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .admin-tab:hover {
          color: #1a2332;
          background: rgba(201, 168, 76, 0.06);
        }

        .admin-tab.active {
          color: #1a2332;
          background: rgba(201, 168, 76, 0.1);
        }

        .admin-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 15%;
          width: 70%;
          height: 2.5px;
          background: #c9a84c;
          border-radius: 2px 2px 0 0;
        }

        .admin-tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          background: #c9a84c;
          border-radius: 10px;
          font-size: 0.7rem;
          margin-left: 6px;
          color: #1a2332;
          font-weight: 700;
          padding: 0 6px;
        }

        .admin-card {
          position: relative;
          z-index: 1;
          background: #faf9f7;
          border: 1px solid #d4cec4;
          border-radius: 14px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
          transform: translateY(16px);
        }

        .admin-card.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .admin-card:hover {
          border-color: #c9a84c;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .admin-card-header {
          padding: 1rem 1.25rem;
          background: #f5f0e6;
          border-bottom: 1px solid #d4cec4;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #1a2332;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-card-body {
          padding: 1.25rem;
        }

        .admin-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .admin-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-field {
          margin-bottom: 0;
        }

        .admin-label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .admin-label.focused {
          color: #1a2332;
        }

        .admin-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: #faf9f7;
          border: 1.5px solid #d4cec4;
          border-radius: 10px;
          padding: 0 12px;
          transition: all 0.25s ease;
        }

        .admin-input-wrap.focused {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }

        .admin-input-icon {
          color: #6b7280;
          font-size: 15px;
          margin-right: 8px;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .admin-input-wrap.focused .admin-input-icon {
          color: #c9a84c;
        }

        .admin-input, .admin-select {
          width: 100%;
          padding: 11px 0;
          background: transparent;
          border: none;
          outline: none;
          color: #1a2332;
          font-size: 0.95rem;
          font-family: inherit;
          appearance: none;
          cursor: pointer;
        }

        .admin-input::placeholder {
          color: #6b7280;
          opacity: 0.5;
        }

        .admin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 13px;
          background: #1a2332;
          color: #f5f0e6;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 1.25rem;
          text-decoration: none;
        }

        .admin-btn:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .admin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-btn-success {
          background: #1a5c3a !important;
          color: #f5f0e6 !important;
          animation: successPop 0.4s ease-out;
        }

        .admin-btn-error {
          background: #b91c3c !important;
          animation: shake 0.35s ease-in-out;
        }

        .admin-btn-outline {
          background: white;
          color: #1a2332;
          border: 1px solid #d4cec4;
        }

        .admin-btn-outline:hover {
          background: #f5f0e6;
        }

        .admin-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f5f0e6;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .admin-toast {
          margin-top: 0.875rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideUp 0.35s ease-out;
        }

        .admin-toast-error {
          background: rgba(185, 28, 60, 0.08);
          border: 1px solid rgba(185, 28, 60, 0.2);
          color: #b91c3c;
        }

        .admin-toast-success {
          background: rgba(26, 35, 50, 0.06);
          border: 1px solid rgba(26, 35, 50, 0.15);
          color: #1a2332;
        }

        .admin-matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.875rem;
        }

        @media (max-width: 576px) {
          .admin-matches-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-match-card {
          background: #faf9f7;
          border: 1px solid #d4cec4;
          border-radius: 12px;
          padding: 1.125rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          animation: cardEnter 0.4s ease-out backwards;
        }

        .admin-match-card:hover {
          transform: translateY(-3px);
          border-color: #c9a84c;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }

        .admin-match-teams {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.625rem;
          flex-wrap: wrap;
        }

        .admin-match-team {
          font-weight: 700;
          color: #1a2332;
          font-size: 0.95rem;
        }

        .admin-match-vs {
          background: #f5f0e6;
          color: #1a2332;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          border: 1px solid #d4cec4;
        }

        .admin-match-info {
          color: #6b7280;
          font-size: 0.82rem;
          margin-bottom: 0.625rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .admin-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .admin-status-scheduled {
          background: rgba(59, 130, 246, 0.08);
          color: #2563eb;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .admin-status-live {
          background: rgba(185, 28, 60, 0.08);
          color: #b91c3c;
          border: 1px solid rgba(185, 28, 60, 0.2);
        }

        .admin-status-live-dot {
          width: 6px;
          height: 6px;
          background: #b91c3c;
          border-radius: 50%;
          animation: livePulse 1.5s ease-in-out infinite;
        }

        .admin-status-completed {
          background: rgba(107, 114, 128, 0.08);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }

        .admin-skeleton {
          background: #f5f0e6;
          border-radius: 12px;
          height: 130px;
          background-image: linear-gradient(90deg, #f5f0e6 0%, #e5e0d8 50%, #f5f0e6 100%);
          background-size: 200% 100%;
          animation: skeleton 1.5s ease-in-out infinite;
        }

        .admin-empty {
          text-align: center;
          padding: 2.5rem;
          color: #6b7280;
        }

        .admin-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          opacity: 0.4;
        }

        .admin-required {
          color: #b91c3c;
        }

        .no-teams-banner {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .no-teams-banner p {
          margin: 0;
          color: #856404;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .admin-header h2 {
            font-size: 1.4rem;
          }
          .admin-tab {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
          .admin-card-header {
            padding: 0.875rem 1rem;
            font-size: 0.72rem;
          }
          .admin-card-body {
            padding: 1rem;
          }
          .admin-input, .admin-select {
            font-size: 16px;
            padding: 13px 0;
          }
          .admin-btn {
            padding: 15px;
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="admin-page">
        <div className="admin-header">
          <h2>🏏 Admin Panel</h2>
          <p>Manage matches and tournaments</p>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => tabSwitch('create')}
          >
            Create New Match
          </button>
          <button
            className={`admin-tab ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => tabSwitch('matches')}
          >
            My Matches
            {matches.length > 0 && <span className="admin-tab-badge">{matches.length}</span>}
          </button>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className={`admin-card ${pageLoaded ? 'loaded' : ''}`}>
            <div className="admin-card-header">📝 Create New Match</div>
            <div className="admin-card-body">
              
              {/* No teams warning with Create Team button */}
              {myTeams.length === 0 && (
                <div className="no-teams-banner">
                  <p>⚠️ You don't have any team yet. Create one to start making matches.</p>
                  <Link to="/my-team" className="admin-btn" style={{ width: 'auto', padding: '10px 16px', margin: 0, fontSize: '0.85rem' }}>
                    <FaPlus /> Create Team
                  </Link>
                </div>
              )}

              <form onSubmit={createMatch}>
                <div className="admin-form-grid">
                  {/* Ground Select */}
                  <div className="admin-field">
                    <label className={`admin-label ${focusedField === 'ground_id' ? 'focused' : ''}`}>
                      Ground <span className="admin-required">*</span>
                    </label>
                    <div className={`admin-input-wrap ${focusedField === 'ground_id' ? 'focused' : ''}`}>
                      <span className="admin-input-icon">🏟️</span>
                      <select
                        name="ground_id"
                        className="admin-select"
                        value={matchForm.ground_id}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('ground_id')}
                        onBlur={() => setFocusedField(null)}
                        required
                      >
                        <option value="">Select Ground</option>
                        {grounds.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Team 1 Select */}
                  <div className="admin-field">
                    <label className={`admin-label ${focusedField === 'team1_id' ? 'focused' : ''}`}>
                      Your Team (Team 1) <span className="admin-required">*</span>
                    </label>
                    <div className={`admin-input-wrap ${focusedField === 'team1_id' ? 'focused' : ''}`}>
                      <span className="admin-input-icon">👕</span>
                      <select
                        name="team1_id"
                        className="admin-select"
                        value={matchForm.team1_id}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('team1_id')}
                        onBlur={() => setFocusedField(null)}
                        required
                      >
                        <option value="">Select Your Team</option>
                        {myTeams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Team 2 Select */}
                  <div className="admin-field">
                    <label className={`admin-label ${focusedField === 'team2_id' ? 'focused' : ''}`}>
                      Opponent (Team 2) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span>
                    </label>
                    <div className={`admin-input-wrap ${focusedField === 'team2_id' ? 'focused' : ''}`}>
                      <span className="admin-input-icon">👕</span>
                      <select
                        name="team2_id"
                        className="admin-select"
                        value={matchForm.team2_id}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('team2_id')}
                        onBlur={() => setFocusedField(null)}
                      >
                        <option value="">Select Opponent</option>
                        {allTeams
                          .filter(t => t.id !== parseInt(matchForm.team1_id))
                          .map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Match Date */}
                  <div className="admin-field">
                    <label className={`admin-label ${focusedField === 'match_date' ? 'focused' : ''}`}>
                      Match Date <span className="admin-required">*</span>
                    </label>
                    <div className={`admin-input-wrap ${focusedField === 'match_date' ? 'focused' : ''}`}>
                      <span className="admin-input-icon">📅</span>
                      <input
                        type="date"
                        name="match_date"
                        className="admin-input"
                        value={matchForm.match_date}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('match_date')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Match Time */}
                <div className="admin-field" style={{ marginTop: '1rem' }}>
                  <label className={`admin-label ${focusedField === 'match_time' ? 'focused' : ''}`}>
                    Match Time <span className="admin-required">*</span>
                  </label>
                  <div className={`admin-input-wrap ${focusedField === 'match_time' ? 'focused' : ''}`}>
                    <span className="admin-input-icon">⏰</span>
                    <input
                      type="time"
                      name="match_time"
                      className="admin-input"
                      value={matchForm.match_time}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('match_time')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`admin-btn ${submitStatus === 'success' ? 'admin-btn-success' : ''} ${submitStatus === 'error' ? 'admin-btn-error' : ''}`}
                  disabled={submitStatus === 'loading' || submitStatus === 'success' || myTeams.length === 0}
                >
                  {submitStatus === 'loading' && <div className="admin-spinner" />}
                  {submitStatus === 'success' ? '✅ Match Created!' :
                   submitStatus === 'error' ? '❌ Failed' :
                   submitStatus === 'loading' ? 'Creating...' : '🏏 Create Match'}
                </button>

                {errorMsg && (
                  <div className="admin-toast admin-toast-error">
                    ⚠️ {errorMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className={`admin-card ${pageLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="admin-card-header">📋 My Matches ({matches.length})</div>
            <div className="admin-card-body">
              {loading ? (
                <div className="admin-matches-grid">
                  {[1, 2, 3, 4].map(i => <div key={i} className="admin-skeleton"></div>)}
                </div>
              ) : matches.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">🏏</div>
                  <p>No matches found. Create your first match!</p>
                </div>
              ) : (
                <div className="admin-matches-grid">
                  {matches.map((match, idx) => (
                    <div
                      key={match.id}
                      className="admin-match-card"
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      <div className="admin-match-teams">
                        <span className="admin-match-team">{match.team1_name}</span>
                        <span className="admin-match-vs">VS</span>
                        <span className="admin-match-team">{match.team2_name || "TBD"}</span>
                      </div>
                      <div className="admin-match-info">
                        <span>🏟️ {match.ground_name}</span>
                        <span>📅 {match.match_date} | ⏰ {match.match_time}</span>
                      </div>
                      <span className={`admin-status-badge ${getStatusBadgeClass(match.status)}`}>
                        {match.status?.toLowerCase() === 'live' && <span className="admin-status-live-dot"></span>}
                        {match.status || 'Scheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;