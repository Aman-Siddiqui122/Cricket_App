import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/matches/');
      setMatches(response.data);
    } catch (err) {
      setError("Failed to load matches");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const getStatusStyle = (status) => {
    const normalized = status?.toLowerCase() || 'scheduled';
    const styles = {
      live: {
        bg: 'rgba(185, 28, 60, 0.08)',
        color: 'var(--cricket-red, #b91c3c)',
        border: 'rgba(185, 28, 60, 0.2)',
        live: true
      },
      scheduled: {
        bg: 'rgba(59, 130, 246, 0.08)',
        color: '#2563eb',
        border: 'rgba(59, 130, 246, 0.2)',
        live: false
      },
      completed: {
        bg: 'rgba(107, 114, 128, 0.08)',
        color: 'var(--cricket-gray, #6b7280)',
        border: 'rgba(107, 114, 128, 0.2)',
        live: false
      },
      cancelled: {
        bg: 'rgba(185, 28, 60, 0.08)',
        color: 'var(--cricket-red, #b91c3c)',
        border: 'rgba(185, 28, 60, 0.2)',
        live: false
      }
    };
    return styles[normalized] || styles.scheduled;
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes skeleton {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes vsPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .matches-page {
          position: relative;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        /* Header */
        .matches-header {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          animation: slideUp 0.45s ease-out;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .matches-header h2 {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin: 0;
        }

        /* Refresh Button */
        .matches-refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .matches-refresh-btn:hover {
          border-color: var(--cricket-gold, #c9a84c);
          color: var(--cricket-gold, #c9a84c);
          background: rgba(201, 168, 76, 0.06);
        }

        .matches-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .matches-refresh-btn.spinning .refresh-icon {
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        /* Loading */
        .matches-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          color: var(--cricket-gray, #6b7280);
        }

        .matches-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--cricket-border, #d4cec4);
          border-top-color: var(--cricket-gold, #c9a84c);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.25rem;
        }

        /* Error */
        .matches-error {
          background: rgba(185, 28, 60, 0.08);
          border: 1px solid rgba(185, 28, 60, 0.2);
          color: var(--cricket-red, #b91c3c);
          padding: 0.875rem 1.25rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          animation: shake 0.4s ease-in-out;
        }

        .matches-error strong {
          font-weight: 700;
        }

        .matches-error p {
          margin: 0;
          font-size: 0.9rem;
        }

        /* Grid */
        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .matches-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Match Card */
        .match-card {
          position: relative;
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          opacity: 0;
          transform: translateY(16px);
          display: flex;
          flex-direction: column;
        }

        .match-card.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .match-card:hover {
          transform: translateY(-4px);
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .match-card:active {
          transform: scale(0.99);
        }

        /* Card Header */
        .match-card-header {
          padding: 0.875rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          background: var(--cricket-cream, #f5f0e6);
        }

        .match-ground {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 0.9rem;
        }

        .match-ground-icon {
          font-size: 1.1rem;
        }

        /* Card Body */
        .match-card-body {
          padding: 1.25rem;
          flex: 1;
        }

        .match-teams {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          margin-bottom: 0.875rem;
          flex-wrap: wrap;
        }

        .match-team {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 1rem;
        }

        .match-vs {
          background: var(--cricket-cream, #f5f0e6);
          color: var(--cricket-navy, #1a2332);
          padding: 0.25rem 0.625rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          border: 1px solid var(--cricket-border, #d4cec4);
          animation: vsPulse 2s ease-in-out infinite;
        }

        .match-meta {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.85rem;
          display: flex;
          gap: 1.25rem;
          margin-bottom: 0.625rem;
          flex-wrap: wrap;
        }

        .match-meta span {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .match-overs {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.7;
        }

        /* Status Badge */
        .match-status {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .match-status.live::before {
          content: '';
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          animation: livePulse 1.5s ease-in-out infinite;
        }

        /* Card Footer */
        .match-card-footer {
          padding: 0.875rem 1.25rem;
          border-top: 1px solid var(--cricket-border, #d4cec4);
        }

        .match-view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.625rem;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .match-view-btn:hover {
          background: var(--cricket-navy, #1a2332);
          border-color: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.15);
        }

        .match-view-btn:active {
          transform: translateY(0);
        }

        /* Empty State */
        .matches-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--cricket-gray, #6b7280);
          animation: fadeIn 0.5s ease-out;
        }

        .matches-empty-icon {
          font-size: 3rem;
          margin-bottom: 0.75rem;
          opacity: 0.35;
        }

        .matches-empty h4 {
          color: var(--cricket-navy, #1a2332);
          margin-bottom: 0.5rem;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .matches-empty p {
          font-size: 0.9rem;
          margin: 0;
          opacity: 0.7;
        }

        /* Skeleton */
        .match-skeleton {
          height: 200px;
          background: var(--cricket-cream, #f5f0e6);
          border-radius: 14px;
          background-image: linear-gradient(90deg, var(--cricket-cream, #f5f0e6) 0%, var(--cricket-light-gray, #e5e0d8) 50%, var(--cricket-cream, #f5f0e6) 100%);
          background-size: 200% 100%;
          animation: skeleton 1.5s ease-in-out infinite;
          border: 1px solid var(--cricket-border, #d4cec4);
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .matches-header h2 {
            font-size: 1.4rem;
          }

          .matches-refresh-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }

          .match-card-header {
            padding: 0.75rem 1rem;
          }

          .match-card-body {
            padding: 1rem;
          }

          .match-card-footer {
            padding: 0.75rem 1rem;
          }

          .match-team {
            font-size: 0.9rem;
          }

          .match-view-btn {
            padding: 0.75rem;
            font-size: 0.85rem;
          }

          .matches-loading {
            padding: 2rem 1rem;
          }

          .matches-empty {
            padding: 2rem 1rem;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .match-card:active {
            transform: scale(0.98);
          }

          .matches-refresh-btn:active {
            transform: scale(0.97);
          }

          .match-view-btn:active {
            transform: scale(0.98);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .matches-page *,
          .matches-page *::before,
          .matches-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="matches-page">
        <div className="matches-header">
          <h2>🏏 Upcoming Matches</h2>
          <button 
            className={`matches-refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
          >
            <span className="refresh-icon">🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading && !refreshing && (
          <div className="matches-loading">
            <div className="matches-loading-spinner"></div>
            <p>Loading matches...</p>
          </div>
        )}

        {error && (
          <div className="matches-error">
            <span>⚠️</span>
            <div>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="matches-grid">
          {loading && !matches.length ? (
            [1, 2, 3, 4].map(i => <div key={i} className="match-skeleton"></div>)
          ) : matches.length === 0 && !loading ? (
            <div className="matches-empty">
              <div className="matches-empty-icon">🏏</div>
              <h4>No Matches Found</h4>
              <p>Check back later for upcoming cricket matches!</p>
            </div>
          ) : (
            matches.map((match, idx) => {
              const statusStyle = getStatusStyle(match.status);
              return (
                <div 
                  key={match.id} 
                  className={`match-card ${pageLoaded ? 'loaded' : ''}`}
                  style={{ transitionDelay: `${idx * 0.08}s` }}
                >
                  <div className="match-card-header">
                    <div className="match-ground">
                      <span className="match-ground-icon">🏟️</span>
                      {match.ground_name || "Unknown Ground"}
                    </div>
                    <span 
                      className={`match-status ${match.status?.toLowerCase()}`}
                      style={{ 
                        background: statusStyle.bg, 
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`
                      }}
                    >
                      {match.status?.toUpperCase() || 'SCHEDULED'}
                    </span>
                  </div>

                  <div className="match-card-body">
                    <div className="match-teams">
                      <span className="match-team">{match.team1_name}</span>
                      <span className="match-vs">VS</span>
                      <span className="match-team">{match.team2_name || "TBD"}</span>
                    </div>

                    <div className="match-meta">
                      <span>📅 {match.match_date}</span>
                      <span>🕒 {match.match_time}</span>
                    </div>

                    <div className="match-overs">
                      <span>🏏</span> {match.overs_per_inning || 20} Overs Match
                    </div>
                  </div>

                  <div className="match-card-footer">
                    <button 
                      className="match-view-btn"
                      onClick={() => navigate(`/matches/${match.id}`)}
                    >
                      <span>👁️</span>
                      View Full Details
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Matches;