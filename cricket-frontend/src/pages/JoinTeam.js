import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCheckCircle, FaUserPlus, FaPhone, FaBaseballBall } from 'react-icons/fa';
import { extractErrorMessage } from '../utils/errorUtils';

const JoinTeam = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', role: 'batsman' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchEligibleTeams();
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchEligibleTeams = async () => {
    try {
      const res = await api.get('/teams/');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const joinTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return setErrorMsg("Please select a team first!");

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post(`/teams/${selectedTeam.id}/add-player`, formData);
      setSuccess(true);
      setTimeout(() => navigate('/my-team'), 2000);
    } catch (err) {
      const msg = extractErrorMessage(err.response?.data?.detail);
      if (msg?.includes("20")) {
        setErrorMsg("This team has reached maximum limit of 20 players.");
      } else {
        setErrorMsg(msg || "Failed to join team. Please try again.");
      }
      setSubmitting(false);
    }
  };

  const roleIcons = {
    batsman: '🏏',
    bowler: '🎯',
    allrounder: '⭐'
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

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes skeleton {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes teamSelect {
          from { transform: scale(1); }
          50% { transform: scale(0.98); }
          to { transform: scale(1); }
        }

        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }

        .join-page {
          position: relative;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        /* Header */
        .join-header {
          position: relative;
          z-index: 1;
          margin-bottom: 1.5rem;
          animation: slideUp 0.45s ease-out;
        }

        .join-header h2 {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin: 0;
        }

        /* Success Screen */
        .join-success {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2.5rem 1rem;
          animation: successPop 0.5s ease-out;
        }

        .join-success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.15);
          border: 2px solid var(--cricket-gold, #c9a84c);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }

        .join-success h4 {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .join-success p {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.9rem;
          margin: 0;
        }

        .join-success-progress {
          width: 180px;
          height: 3px;
          background: var(--cricket-border, #d4cec4);
          border-radius: 2px;
          margin: 1.25rem auto 0;
          overflow: hidden;
        }

        .join-success-progress-bar {
          height: 100%;
          background: var(--cricket-gold, #c9a84c);
          border-radius: 2px;
          animation: progressFill 2s ease-out forwards;
        }

        /* Layout */
        .join-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 992px) {
          .join-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Teams Panel */
        .join-teams-panel {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          animation: cardEnter 0.45s ease-out;
        }

        .join-teams-header {
          padding: 1rem 1.25rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .join-team-list {
          padding: 0.5rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .join-team-list::-webkit-scrollbar {
          width: 5px;
        }

        .join-team-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .join-team-list::-webkit-scrollbar-thumb {
          background: var(--cricket-border, #d4cec4);
          border-radius: 3px;
        }

        .join-team-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1.5px solid transparent;
          margin-bottom: 0.25rem;
        }

        .join-team-item:hover {
          background: rgba(201, 168, 76, 0.06);
          border-color: var(--cricket-border, #d4cec4);
        }

        .join-team-item.selected {
          background: rgba(201, 168, 76, 0.1);
          border-color: var(--cricket-gold, #c9a84c);
          animation: teamSelect 0.25s ease-out;
        }

        .join-team-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--cricket-cream, #f5f0e6);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .join-team-info {
          flex: 1;
          min-width: 0;
        }

        .join-team-name {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .join-team-meta {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.78rem;
          margin-top: 0.2rem;
        }

        .join-team-progress {
          width: 50px;
          height: 3px;
          background: var(--cricket-border, #d4cec4);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.4rem;
        }

        .join-team-progress-bar {
          height: 100%;
          background: var(--cricket-gold, #c9a84c);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .join-team-badge {
          padding: 0.3rem 0.625rem;
          background: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Form Panel */
        .join-form-panel {
          position: relative;
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          animation: cardEnter 0.45s ease-out 0.1s both;
        }

        .join-form-header {
          padding: 1rem 1.25rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 0.95rem;
        }

        .join-form-header strong {
          color: var(--cricket-gold, #c9a84c);
        }

        .join-form-body {
          padding: 1.25rem;
        }

        /* Form Fields */
        .join-field {
          margin-bottom: 1rem;
        }

        .join-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.375rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--cricket-gray, #6b7280);
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .join-label.focused {
          color: var(--cricket-navy, #1a2332);
        }

        .join-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--cricket-white, #faf9f7);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          padding: 0 12px;
          transition: all 0.25s ease;
        }

        .join-input-wrap.focused {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }

        .join-input-wrap.error {
          border-color: var(--cricket-red, #b91c3c);
          animation: shake 0.35s ease-in-out;
        }

        .join-input-icon {
          color: var(--cricket-gray, #6b7280);
          font-size: 15px;
          margin-right: 8px;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .join-input-wrap.focused .join-input-icon {
          color: var(--cricket-gold, #c9a84c);
        }

        .join-input {
          width: 100%;
          padding: 11px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          font-family: inherit;
        }

        .join-input::placeholder {
          color: var(--cricket-gray, #6b7280);
          opacity: 0.5;
        }

        .join-select {
          width: 100%;
          padding: 11px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          cursor: pointer;
          font-family: inherit;
        }

        .join-select option {
          background: var(--cricket-white, #faf9f7);
          color: var(--cricket-navy, #1a2332);
        }

        /* Role Selector */
        .join-role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.625rem;
        }

        @media (max-width: 576px) {
          .join-role-grid {
            grid-template-columns: 1fr;
          }
        }

        .join-role-option {
          padding: 0.875rem;
          background: var(--cricket-cream, #f5f0e6);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .join-role-option:hover {
          border-color: var(--cricket-gold, #c9a84c);
          background: rgba(201, 168, 76, 0.08);
        }

        .join-role-option.selected {
          background: rgba(201, 168, 76, 0.12);
          border-color: var(--cricket-gold, #c9a84c);
        }

        .join-role-icon {
          font-size: 1.25rem;
          margin-bottom: 0.375rem;
        }

        .join-role-label {
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.82rem;
        }

        /* Submit Button */
        .join-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 13px;
          background: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }

        .join-submit:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .join-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .join-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .join-submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--cricket-cream, #f5f0e6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Error Toast */
        .join-error {
          background: rgba(185, 28, 60, 0.08);
          border: 1px solid rgba(185, 28, 60, 0.2);
          color: var(--cricket-red, #b91c3c);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          animation: shake 0.35s ease-in-out;
        }

        /* Empty State */
        .join-empty {
          text-align: center;
          padding: 2.5rem 1.25rem;
          color: var(--cricket-gray, #6b7280);
        }

        .join-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          opacity: 0.35;
        }

        .join-empty p {
          font-size: 0.9rem;
          margin: 0;
        }

        /* Skeleton */
        .join-skeleton {
          height: 52px;
          background: var(--cricket-cream, #f5f0e6);
          border-radius: 10px;
          background-image: linear-gradient(90deg, var(--cricket-cream, #f5f0e6) 0%, var(--cricket-light-gray, #e5e0d8) 50%, var(--cricket-cream, #f5f0e6) 100%);
          background-size: 200% 100%;
          animation: skeleton 1.5s ease-in-out infinite;
          margin-bottom: 0.375rem;
        }

        /* Info Alert */
        .join-info {
          background: var(--cricket-cream, #f5f0e6);
          border: 1px solid var(--cricket-border, #d4cec4);
          color: var(--cricket-gray, #6b7280);
          padding: 2rem 1.5rem;
          border-radius: 12px;
          text-align: center;
        }

        .join-info-icon {
          font-size: 1.75rem;
          margin-bottom: 0.625rem;
        }

        .join-info p {
          margin: 0;
          font-size: 0.9rem;
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .join-header h2 {
            font-size: 1.4rem;
          }

          .join-success {
            padding: 2rem 1rem;
          }

          .join-success h4 {
            font-size: 1.1rem;
          }

          .join-teams-header,
          .join-form-header {
            padding: 0.875rem 1rem;
          }

          .join-form-body {
            padding: 1rem;
          }

          .join-input,
          .join-select {
            font-size: 16px; /* iOS zoom fix */
            padding: 13px 0;
          }

          .join-submit {
            padding: 15px;
            font-size: 0.95rem;
          }

          .join-role-grid {
            grid-template-columns: 1fr;
          }

          .join-team-item {
            padding: 0.75rem;
          }

          .join-team-icon {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .join-team-item:active {
            transform: scale(0.98);
            background: rgba(201, 168, 76, 0.12);
          }

          .join-role-option:active {
            transform: scale(0.98);
          }

          .join-submit:active:not(:disabled) {
            transform: scale(0.98);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .join-page *,
          .join-page *::before,
          .join-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="join-page">
        <div className="join-header">
          <h2><FaUserPlus /> Join a Team</h2>
        </div>

        {success ? (
          <div className="join-success">
            <div className="join-success-icon">
              <FaCheckCircle size={32} color="var(--cricket-gold, #c9a84c)" />
            </div>
            <h4>Successfully Joined the Team!</h4>
            <p>Redirecting to My Team page...</p>
            <div className="join-success-progress">
              <div className="join-success-progress-bar"></div>
            </div>
          </div>
        ) : (
          <div className="join-layout">
            {/* Teams List */}
            <div className="join-teams-panel">
              <div className="join-teams-header">
                <FaUsers /> Available Teams
              </div>
              <div className="join-team-list">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => <div key={i} className="join-skeleton"></div>)
                ) : teams.length === 0 ? (
                  <div className="join-empty">
                    <div className="join-empty-icon">🏏</div>
                    <p>No active teams available</p>
                  </div>
                ) : (
                  teams.map((team) => (
                    <div
                      key={team.id}
                      className={`join-team-item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedTeam(team); setErrorMsg(''); }}
                    >
                      <div className="join-team-icon">🏏</div>
                      <div className="join-team-info">
                        <div className="join-team-name">{team.name}</div>
                        <div className="join-team-meta">
                          {team.players_count || 0} / 20 players
                        </div>
                        <div className="join-team-progress">
                          <div
                            className="join-team-progress-bar"
                            style={{ width: `${((team.players_count || 0) / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="join-team-badge">Join</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Join Form */}
            <div className="join-form-panel">
              {selectedTeam ? (
                <>
                  <div className="join-form-header">
                    Joining: <strong>{selectedTeam.name}</strong>
                  </div>
                  <div className="join-form-body">
                    {errorMsg && (
                      <div className="join-error">
                        <span>⚠️</span> {errorMsg}
                      </div>
                    )}

                    <form onSubmit={joinTeam}>
                      <div className="join-field">
                        <label className={`join-label ${focusedField === 'name' ? 'focused' : ''}`}>
                          <FaUserPlus size={14} /> Your Full Name *
                        </label>
                        <div className={`join-input-wrap ${focusedField === 'name' ? 'focused' : ''} ${errorMsg && !formData.name ? 'error' : ''}`}>
                          <span className="join-input-icon">👤</span>
                          <input
                            type="text"
                            name="name"
                            className="join-input"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                        </div>
                      </div>

                      <div className="join-field">
                        <label className={`join-label ${focusedField === 'phone' ? 'focused' : ''}`}>
                          <FaPhone size={14} /> Phone Number
                        </label>
                        <div className={`join-input-wrap ${focusedField === 'phone' ? 'focused' : ''}`}>
                          <span className="join-input-icon">📱</span>
                          <input
                            type="tel"
                            name="phone"
                            className="join-input"
                            placeholder="03XX-XXXXXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                      </div>

                      <div className="join-field">
                        <label className="join-label">
                          <FaBaseballBall size={14} /> Your Playing Role *
                        </label>
                        <div className="join-role-grid">
                          {[
                            { value: 'batsman', label: 'Batsman' },
                            { value: 'bowler', label: 'Bowler' },
                            { value: 'allrounder', label: 'All-Rounder' }
                          ].map((role) => (
                            <div
                              key={role.value}
                              className={`join-role-option ${formData.role === role.value ? 'selected' : ''}`}
                              onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                            >
                              <div className="join-role-icon">{roleIcons[role.value]}</div>
                              <div className="join-role-label">{role.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="join-submit"
                        disabled={submitting}
                      >
                        {submitting && <div className="join-submit-spinner"></div>}
                        {submitting ? "Joining Team..." : `Join ${selectedTeam.name}`}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="join-info">
                  <div className="join-info-icon">👈</div>
                  <p>Please select a team from the left side to join.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JoinTeam;