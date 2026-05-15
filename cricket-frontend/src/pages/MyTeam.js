import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaUsers, FaCrown, FaPhone, FaMoneyBillWave, FaPlus } from 'react-icons/fa';
import { extractErrorMessage } from '../utils/errorUtils';

const MyTeam = () => {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageLoaded, setPageLoaded] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [newTeam, setNewTeam] = useState({ name: '', contact_number: '', jazzcash_number: '' });
  const [newPlayer, setNewPlayer] = useState({ name: '', phone: '', role: 'batsman' });

  useEffect(() => {
    fetchTeamData();
    setTimeout(() => setPageLoaded(true), 100);
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const teamRes = await api.get('/teams/my-team');
      setTeam(teamRes.data);
      const playersRes = await api.get(`/teams/${teamRes.data.id}/players`);
      setPlayers(playersRes.data);
    } catch (err) {
      if (err.response?.status === 404) setTeam(null);
      else setError("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams/', newTeam);
      setShowCreateModal(false);
      fetchTeamData();
    } catch (err) {
      alert(extractErrorMessage(err.response?.data?.detail, "Failed to create team"));
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${team.id}/add-player`, newPlayer);
      setShowAddModal(false);
      setNewPlayer({ name: '', phone: '', role: 'batsman' });
      fetchTeamData();
    } catch (err) {
      alert(extractErrorMessage(err.response?.data?.detail, "Failed to add player"));
    }
  };

  const paySubscription = () => {
    alert("JazzCash Payment Flow Coming Soon...\nSend 250 PKR to our number to continue after trial.");
  };

  const roleIcons = {
    batsman: '🏏', bowler: '🎯', allrounder: '⭐'
  };

  if (loading) return (
    <div className="team-loading-screen">
      <div className="team-loading-spinner"></div>
      <p>Loading your team...</p>
    </div>
  );

  if (!team) {
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

          @keyframes bounceIn {
            0% { transform: scale(0.9); opacity: 0; }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes cardEnter {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          .team-page {
            position: relative;
            min-height: 100vh;
            padding-bottom: 2rem;
          }

          /* Loading Screen */
          .team-loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: var(--cricket-gray, #6b7280);
          }

          .team-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--cricket-border, #d4cec4);
            border-top-color: var(--cricket-gold, #c9a84c);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1.25rem;
          }

          /* Empty State */
          .team-empty-card {
            position: relative;
            z-index: 1;
            max-width: 560px;
            margin: 2.5rem auto;
            background: var(--cricket-white, #faf9f7);
            border: 1px solid var(--cricket-border, #d4cec4);
            border-radius: 16px;
            padding: 2.5rem;
            text-align: center;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            animation: bounceIn 0.5s ease-out;
          }

          .team-empty-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(201, 168, 76, 0.15);
            border: 2px solid var(--cricket-gold, #c9a84c);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.25rem;
            font-size: 2.5rem;
          }

          .team-empty-title {
            color: var(--cricket-navy, #1a2332);
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 0.625rem;
          }

          .team-empty-desc {
            color: var(--cricket-gray, #6b7280);
            font-size: 1rem;
            margin-bottom: 1.75rem;
            line-height: 1.5;
          }

          .team-btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            background: var(--cricket-navy, #1a2332);
            color: var(--cricket-cream, #f5f0e6);
            border: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.25s ease;
          }

          .team-btn-primary:hover {
            background: #252f40;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
          }

          .team-btn-outline {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            background: transparent;
            border: 1.5px solid var(--cricket-border, #d4cec4);
            border-radius: 10px;
            color: var(--cricket-navy, #1a2332);
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.25s ease;
            text-decoration: none;
          }

          .team-btn-outline:hover {
            background: var(--cricket-navy, #1a2332);
            border-color: var(--cricket-navy, #1a2332);
            color: var(--cricket-cream, #f5f0e6);
            transform: translateY(-1px);
          }

          /* Modal */
          .team-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(26, 35, 50, 0.75);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            animation: fadeIn 0.3s ease;
          }

          .team-modal {
            background: var(--cricket-white, #faf9f7);
            border: 1px solid var(--cricket-border, #d4cec4);
            border-radius: 16px;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            animation: slideUp 0.4s ease-out;
            overflow: hidden;
          }

          .team-modal-header {
            padding: 1.25rem 1.5rem;
            background: var(--cricket-cream, #f5f0e6);
            border-bottom: 1px solid var(--cricket-border, #d4cec4);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .team-modal-header h5 {
            color: var(--cricket-navy, #1a2332);
            font-weight: 700;
            margin: 0;
            font-size: 1rem;
          }

          .team-modal-close {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: transparent;
            border: 1.5px solid var(--cricket-border, #d4cec4);
            color: var(--cricket-gray, #6b7280);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.25s ease;
            font-size: 1.25rem;
            line-height: 1;
          }

          .team-modal-close:hover {
            background: var(--cricket-red, #b91c3c);
            border-color: var(--cricket-red, #b91c3c);
            color: var(--cricket-cream, #f5f0e6);
            transform: rotate(90deg);
          }

          .team-modal-body {
            padding: 1.5rem;
          }

          .team-modal-footer {
            padding: 1rem 1.5rem;
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
            border-top: 1px solid var(--cricket-border, #d4cec4);
          }

          /* Form Fields */
          .team-field {
            margin-bottom: 1.25rem;
          }

          .team-label {
            display: block;
            margin-bottom: 0.375rem;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--cricket-gray, #6b7280);
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .team-label.focused {
            color: var(--cricket-navy, #1a2332);
          }

          .team-input-wrap {
            display: flex;
            align-items: center;
            background: var(--cricket-white, #faf9f7);
            border: 1.5px solid var(--cricket-border, #d4cec4);
            border-radius: 10px;
            padding: 0 12px;
            transition: all 0.25s ease;
          }

          .team-input-wrap.focused {
            border-color: var(--cricket-gold, #c9a84c);
            box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
          }

          .team-input {
            width: 100%;
            padding: 11px 0;
            background: transparent;
            border: none;
            outline: none;
            color: var(--cricket-navy, #1a2332);
            font-size: 0.95rem;
            font-family: inherit;
          }

          .team-input::placeholder {
            color: var(--cricket-gray, #6b7280);
            opacity: 0.5;
          }

          .team-btn-submit {
            padding: 0.75rem 1.5rem;
            background: var(--cricket-navy, #1a2332);
            color: var(--cricket-cream, #f5f0e6);
            border: none;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s ease;
          }

          .team-btn-submit:hover {
            background: #252f40;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
          }

          .team-btn-cancel {
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: 1.5px solid var(--cricket-border, #d4cec4);
            border-radius: 10px;
            color: var(--cricket-gray, #6b7280);
            cursor: pointer;
            transition: all 0.25s ease;
            font-weight: 600;
          }

          .team-btn-cancel:hover {
            background: var(--cricket-cream, #f5f0e6);
            color: var(--cricket-navy, #1a2332);
          }

          /* ===== MOBILE ===== */
          @media (max-width: 768px) {
            .team-empty-card {
              padding: 1.75rem;
              margin: 1.5rem auto;
            }

            .team-empty-icon {
              width: 64px;
              height: 64px;
              font-size: 2rem;
            }

            .team-empty-title {
              font-size: 1.3rem;
            }

            .team-empty-desc {
              font-size: 0.9rem;
            }

            .team-btn-primary,
            .team-btn-outline {
              padding: 0.75rem 1.5rem;
              font-size: 0.9rem;
              width: 100%;
              justify-content: center;
            }

            .team-modal {
              border-radius: 12px 12px 0 0;
              max-height: 90vh;
              overflow-y: auto;
            }

            .team-modal-header,
            .team-modal-body,
            .team-modal-footer {
              padding: 1rem 1.25rem;
            }

            .team-input {
              font-size: 16px; /* iOS zoom fix */
              padding: 13px 0;
            }
          }

          /* Touch feedback */
          @media (hover: none) {
            .team-btn-primary:active,
            .team-btn-outline:active {
              transform: scale(0.98);
            }

            .team-modal-close:active {
              transform: scale(0.95);
            }
          }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .team-page *,
            .team-page *::before,
            .team-page *::after {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>

        <div className="team-page">
          <div className="team-empty-card">
            <div className="team-empty-icon">🏏</div>
            <h2 className="team-empty-title">No Team Found</h2>
            <p className="team-empty-desc">
              You are not leading any team yet. Take the lead and register your Karachi cricket team today!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="team-btn-primary" onClick={() => setShowCreateModal(true)}>
                <FaPlus /> Register My Team
              </button>
               <Link to="/join-team" className="team-btn-outline">
                 Join Existing Team
               </Link>
            </div>
          </div>

          {showCreateModal && (
            <div className="team-modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="team-modal" onClick={e => e.stopPropagation()}>
                <div className="team-modal-header">
                  <h5>🏏 Register Your Team</h5>
                  <button className="team-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                </div>
                <form onSubmit={handleCreateTeam}>
                  <div className="team-modal-body">
                    <div className="team-field">
                      <label className={`team-label ${focusedField === 'teamName' ? 'focused' : ''}`}>
                        Team Name
                      </label>
                      <div className={`team-input-wrap ${focusedField === 'teamName' ? 'focused' : ''}`}>
                        <input
                          type="text" className="team-input" required
                          value={newTeam.name}
                          onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                          onFocus={() => setFocusedField('teamName')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="e.g. Karachi Kings"
                        />
                      </div>
                    </div>
                    <div className="team-field">
                      <label className={`team-label ${focusedField === 'contact' ? 'focused' : ''}`}>
                        Contact Number (WhatsApp)
                      </label>
                      <div className={`team-input-wrap ${focusedField === 'contact' ? 'focused' : ''}`}>
                        <input
                          type="tel" className="team-input" required
                          value={newTeam.contact_number}
                          onChange={(e) => setNewTeam({...newTeam, contact_number: e.target.value})}
                          onFocus={() => setFocusedField('contact')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="03xx-xxxxxxx"
                        />
                      </div>
                    </div>
                    <div className="team-field">
                      <label className={`team-label ${focusedField === 'jazzcash' ? 'focused' : ''}`}>
                        JazzCash Number
                      </label>
                      <div className={`team-input-wrap ${focusedField === 'jazzcash' ? 'focused' : ''}`}>
                        <input
                          type="tel" className="team-input"
                          value={newTeam.jazzcash_number}
                          onChange={(e) => setNewTeam({...newTeam, jazzcash_number: e.target.value})}
                          onFocus={() => setFocusedField('jazzcash')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="team-modal-footer">
                    <button type="button" className="team-btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                    <button type="submit" className="team-btn-submit">Create Team</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }

        .team-dashboard {
          position: relative;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        /* Loading */
        .team-loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          color: var(--cricket-gray, #6b7280);
        }

        .team-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--cricket-border, #d4cec4);
          border-top-color: var(--cricket-gold, #c9a84c);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.25rem;
        }

        /* Header */
        .team-header {
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

        .team-header-title h2 {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 0.25rem;
        }

        .team-header-title p {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.9rem;
          margin: 0;
        }

        .team-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .team-status-trial {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.25);
          color: #b45309;
        }

        .team-status-active {
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.25);
          color: var(--cricket-navy, #1a2332);
        }

        /* Error */
        .team-error {
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

        /* Dashboard Grid */
        .team-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 992px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Info Card */
        .team-info-card {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          animation: cardEnter 0.45s ease-out;
        }

        .team-info-header {
          padding: 1rem 1.25rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .team-info-header h5 {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          margin: 0;
          font-size: 1rem;
        }

        .team-crown {
          font-size: 1.25rem;
        }

        .team-info-body {
          padding: 1.25rem;
        }

        .team-info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .team-info-row label {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.78rem;
          display: block;
          margin-bottom: 0.2rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .team-info-row .value {
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .team-info-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--cricket-cream, #f5f0e6);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .team-progress-wrap {
          margin: 1rem 0;
        }

        .team-progress-label {
          display: flex;
          justify-content: space-between;
          color: var(--cricket-gray, #6b7280);
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .team-progress-bar {
          width: 100%;
          height: 6px;
          background: var(--cricket-border, #d4cec4);
          border-radius: 3px;
          overflow: hidden;
        }

        .team-progress-fill {
          height: 100%;
          background: var(--cricket-gold, #c9a84c);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .team-alert-trial {
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.2);
          color: #b45309;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .team-btn-pay {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem;
          background: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 1rem;
        }

        .team-btn-pay:hover {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        /* Players Panel */
        .team-players-panel {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          animation: cardEnter 0.45s ease-out 0.1s both;
        }

        .team-players-header {
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          background: var(--cricket-cream, #f5f0e6);
        }

        .team-players-header h5 {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }

        .team-add-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .team-add-btn:hover {
          background: var(--cricket-navy, #1a2332);
          border-color: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          transform: translateY(-1px);
        }

        .team-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Player Cards */
        .team-players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.875rem;
          padding: 1.25rem;
        }

        @media (max-width: 576px) {
          .team-players-grid {
            grid-template-columns: 1fr;
          }
        }

        .team-player-card {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem;
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .team-player-card:hover {
          border-color: var(--cricket-gold, #c9a84c);
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .team-player-avatar {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--cricket-cream, #f5f0e6);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .team-player-info {
          flex: 1;
          min-width: 0;
        }

        .team-player-name {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .team-player-role {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.6rem;
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 20px;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 0.3rem;
        }

        .team-player-phone {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.78rem;
          margin-top: 0.25rem;
        }

        /* Empty Players */
        .team-players-empty {
          text-align: center;
          padding: 2.5rem;
          color: var(--cricket-gray, #6b7280);
        }

        .team-players-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          opacity: 0.35;
        }

        .team-players-empty h6 {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .team-players-empty p {
          font-size: 0.85rem;
          margin: 0;
          opacity: 0.7;
        }

        /* Modal */
        .team-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 35, 50, 0.75);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.3s ease;
        }

        .team-modal {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.4s ease-out;
          overflow: hidden;
        }

        .team-modal-header {
          padding: 1.25rem 1.5rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .team-modal-header h5 {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          margin: 0;
          font-size: 1rem;
        }

        .team-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          color: var(--cricket-gray, #6b7280);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          font-size: 1.25rem;
          line-height: 1;
        }

        .team-modal-close:hover {
          background: var(--cricket-red, #b91c3c);
          border-color: var(--cricket-red, #b91c3c);
          color: var(--cricket-cream, #f5f0e6);
          transform: rotate(90deg);
        }

        .team-modal-body {
          padding: 1.5rem;
        }

        .team-modal-footer {
          padding: 1rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          border-top: 1px solid var(--cricket-border, #d4cec4);
        }

        /* Role Selector */
        .team-role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 576px) {
          .team-role-grid {
            grid-template-columns: 1fr;
          }
        }

        .team-role-option {
          padding: 1rem;
          background: var(--cricket-cream, #f5f0e6);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .team-role-option:hover {
          border-color: var(--cricket-gold, #c9a84c);
          background: rgba(201, 168, 76, 0.08);
        }

        .team-role-option.selected {
          background: rgba(201, 168, 76, 0.12);
          border-color: var(--cricket-gold, #c9a84c);
        }

        .team-role-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .team-role-label {
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.85rem;
        }

        .team-btn-submit {
          padding: 0.75rem 1.5rem;
          background: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .team-btn-submit:hover {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .team-btn-cancel {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          color: var(--cricket-gray, #6b7280);
          cursor: pointer;
          transition: all 0.25s ease;
          font-weight: 600;
        }

        .team-btn-cancel:hover {
          background: var(--cricket-cream, #f5f0e6);
          color: var(--cricket-navy, #1a2332);
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .team-header-title h2 {
            font-size: 1.4rem;
          }

          .team-status-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.875rem;
          }

          .team-info-header,
          .team-players-header {
            padding: 0.875rem 1rem;
          }

          .team-info-body {
            padding: 1rem;
          }

          .team-players-grid {
            padding: 1rem;
            gap: 0.75rem;
          }

          .team-player-card {
            padding: 0.75rem;
          }

          .team-modal {
            border-radius: 12px 12px 0 0;
            max-height: 90vh;
            overflow-y: auto;
          }

          .team-modal-header,
          .team-modal-body,
          .team-modal-footer {
            padding: 1rem 1.25rem;
          }

          .team-input {
            font-size: 16px; /* iOS zoom fix */
            padding: 13px 0;
          }

          .team-add-btn {
            padding: 0.5rem 0.875rem;
            font-size: 0.8rem;
          }

          .team-btn-pay {
            padding: 0.75rem;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .team-player-card:active {
            transform: scale(0.98);
          }

          .team-add-btn:active {
            transform: scale(0.97);
          }

          .team-btn-pay:active {
            transform: scale(0.98);
          }

          .team-modal-close:active {
            transform: scale(0.95);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .team-dashboard *,
          .team-dashboard *::before,
          .team-dashboard *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="team-dashboard">
        <div className="team-header">
          <div className="team-header-title">
            <h2>👑 My Team Dashboard</h2>
            <p>Manage your squad and subscription</p>
          </div>
          <span className={`team-status-badge ${team.subscription_status === 'trial' ? 'team-status-trial' : 'team-status-active'}`}>
            {team.subscription_status === 'trial' ? '⏳ TRIAL' : '✅ ACTIVE'}
            {team.subscription_status === 'trial' && " (3 Months)"}
          </span>
        </div>

        {error && (
          <div className="team-error">
            <span>⚠️</span>
            <div>
              <strong>Error</strong>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
            </div>
          </div>
        )}

        <div className="team-grid">
          {/* Team Info Card */}
          <div className="team-info-card">
            <div className="team-info-header">
              <span className="team-crown">👑</span>
              <h5>{team.name}</h5>
            </div>
            <div className="team-info-body">
              <div className="team-info-row">
                <div className="team-info-icon">📱</div>
                <div>
                  <label>Contact</label>
                  <div className="value">{team.contact_number || "Not provided"}</div>
                </div>
              </div>
              <div className="team-info-row">
                <div className="team-info-icon">💰</div>
                <div>
                  <label>JazzCash</label>
                  <div className="value">{team.jazzcash_number || "Not provided"}</div>
                </div>
              </div>

              <div className="team-progress-wrap">
                <div className="team-progress-label">
                  <span>Squad Size</span>
                  <span>{players.length} / 20</span>
                </div>
                <div className="team-progress-bar">
                  <div 
                    className="team-progress-fill" 
                    style={{ width: `${(players.length / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--cricket-gray, #6b7280)', fontSize: '0.85rem' }}>Status</span>
                <span style={{ color: 'var(--cricket-navy, #1a2332)', fontWeight: 700 }}>Active</span>
              </div>

              {team.subscription_status === 'trial' ? (
                <div className="team-alert-trial">
                  <span>⏳</span>
                  Your 3-month trial is active! No payment needed yet.
                </div>
              ) : (
                <button className="team-btn-pay" onClick={paySubscription}>
                  <FaMoneyBillWave /> Renew Subscription (250 PKR)
                </button>
              )}
            </div>
          </div>

          {/* Players Panel */}
          <div className="team-players-panel">
            <div className="team-players-header">
              <h5>👥 Team Members ({players.length})</h5>
              <button 
                className="team-add-btn"
                onClick={() => setShowAddModal(true)}
                disabled={players.length >= 20}
              >
                <FaPlus /> Add Member
              </button>
            </div>

            {players.length === 0 ? (
              <div className="team-players-empty">
                <div className="team-players-empty-icon">👤</div>
                <h6>No players joined yet</h6>
                <p>Share your team name and ask players to join, or add them manually.</p>
              </div>
            ) : (
              <div className="team-players-grid">
                {players.map((player, idx) => (
                  <div 
                    key={player.id} 
                    className="team-player-card"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="team-player-avatar">
                      {roleIcons[player.role] || '🏏'}
                    </div>
                    <div className="team-player-info">
                      <div className="team-player-name">{player.name}</div>
                      <span className="team-player-role">
                        {player.role?.toUpperCase()}
                      </span>
                      {player.phone && (
                        <div className="team-player-phone">📞 {player.phone}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Player Modal */}
        {showAddModal && (
          <div className="team-modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="team-modal" onClick={e => e.stopPropagation()}>
              <div className="team-modal-header">
                <h5>👤 Add Team Member</h5>
                <button className="team-modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddPlayer}>
                <div className="team-modal-body">
                  <div className="team-field">
                    <label className={`team-label ${focusedField === 'playerName' ? 'focused' : ''}`}>
                      Player Name
                    </label>
                    <div className={`team-input-wrap ${focusedField === 'playerName' ? 'focused' : ''}`}>
                      <input
                        type="text" className="team-input" required
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                        onFocus={() => setFocusedField('playerName')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                  <div className="team-field">
                    <label className={`team-label ${focusedField === 'playerPhone' ? 'focused' : ''}`}>
                      Phone Number
                    </label>
                    <div className={`team-input-wrap ${focusedField === 'playerPhone' ? 'focused' : ''}`}>
                      <input
                        type="tel" className="team-input"
                        value={newPlayer.phone}
                        onChange={(e) => setNewPlayer({...newPlayer, phone: e.target.value})}
                        onFocus={() => setFocusedField('playerPhone')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                  <label className="team-label">Playing Role</label>
                  <div className="team-role-grid">
                    {[
                      { value: 'batsman', label: 'Batsman', icon: '🏏' },
                      { value: 'bowler', label: 'Bowler', icon: '🎯' },
                      { value: 'allrounder', label: 'All-Rounder', icon: '⭐' }
                    ].map((role) => (
                      <div
                        key={role.value}
                        className={`team-role-option ${newPlayer.role === role.value ? 'selected' : ''}`}
                        onClick={() => setNewPlayer(prev => ({ ...prev, role: role.value }))}
                      >
                        <div className="team-role-icon">{role.icon}</div>
                        <div className="team-role-label">{role.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="team-modal-footer">
                  <button type="button" className="team-btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="team-btn-submit">Add Player</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyTeam;