import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StatsModal = ({ player, matchId, teamId, onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    runs: 0,
    balls_faced: 0,
    fours: 0,
    sixes: 0,
    wickets_taken: 0,
    overs_bowled: 0.0,
    dot_balls: 0,
    wide_balls: 0,
    no_balls: 0,
    is_not_out: false,
  });

  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState({ strikeRate: 0, runRate: 0 });
  const [focusedField, setFocusedField] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setModalVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : (name === 'overs_bowled' ? parseFloat(value) : parseInt(value) || 0)
    };
    setFormData(newData);

    if (name === 'runs' || name === 'balls_faced') {
      const sr = newData.balls_faced > 0 ? (newData.runs / newData.balls_faced) * 100 : 0;
      setCalculated(prev => ({ ...prev, strikeRate: sr.toFixed(2) }));
    }
  };

  const submitStats = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/stats/add?match_id=${matchId}`, {
        player_id: player.id,
        team_id: teamId,
        ...formData,
      });

      setModalVisible(false);
      setTimeout(() => {
        onClose();
        if (refreshData) refreshData();
      }, 400);
    } catch (err) {
      alert("Failed to save stats. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => onClose(), 400);
  };

  const statFields = {
    batting: [
      { name: 'runs', label: 'Runs', icon: '🏃' },
      { name: 'balls_faced', label: 'Balls Faced', icon: '⚪' },
      { name: 'fours', label: 'Fours', icon: '4️⃣' },
      { name: 'sixes', label: 'Sixes', icon: '6️⃣' },
    ],
    bowling: [
      { name: 'wickets_taken', label: 'Wickets', icon: '🎯' },
      { name: 'overs_bowled', label: 'Overs', icon: '⏱️', step: 0.1 },
      { name: 'dot_balls', label: 'Dot Balls', icon: '⚫' },
      { name: 'wide_balls', label: 'Wides', icon: '↔️' },
      { name: 'no_balls', label: 'No Balls', icon: '❌' },
    ]
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(30px) scale(0.97); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes statPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        /* ===== OVERLAY ===== */
        .stats-overlay {
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

        /* ===== MODAL ===== */
        .stats-modal {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 16px;
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .stats-modal.entering {
          animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .stats-modal.exiting {
          animation: slideDown 0.35s ease-out forwards;
        }

        /* ===== HEADER ===== */
        .stats-header {
          padding: 1.25rem 1.5rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .stats-header-info {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .stats-player-avatar {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--cricket-cream, #f5f0e6);
          border: 2px solid var(--cricket-gold, #c9a84c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .stats-header-text h5 {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 1rem;
          margin: 0;
          line-height: 1.3;
        }

        .stats-header-text p {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.8rem;
          margin: 0;
          margin-top: 2px;
        }

        .stats-close-btn {
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
          flex-shrink: 0;
        }

        .stats-close-btn:hover {
          background: var(--cricket-red, #b91c3c);
          border-color: var(--cricket-red, #b91c3c);
          color: var(--cricket-cream, #f5f0e6);
          transform: rotate(90deg);
        }

        /* ===== BODY ===== */
        .stats-body {
          padding: 1.25rem 1.5rem;
        }

        /* ===== SECTIONS ===== */
        .stats-section {
          margin-bottom: 1.25rem;
        }

        .stats-section-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.875rem;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
        }

        .stats-section-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .stats-section-title {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 0.9rem;
          margin: 0;
        }

        .stats-batting-icon {
          background: rgba(201, 168, 76, 0.15);
        }

        .stats-bowling-icon {
          background: rgba(185, 28, 60, 0.1);
        }

        /* ===== GRID ===== */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        /* ===== FIELD ===== */
        .stats-field {
          position: relative;
        }

        .stats-field-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.375rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--cricket-gray, #6b7280);
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .stats-field-label.focused {
          color: var(--cricket-navy, #1a2332);
        }

        .stats-field-icon {
          font-size: 0.9rem;
        }

        .stats-input-wrap {
          display: flex;
          align-items: center;
          background: var(--cricket-white, #faf9f7);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          padding: 0 12px;
          transition: all 0.25s ease;
        }

        .stats-input-wrap.focused {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
          background: var(--cricket-white, #faf9f7);
        }

        .stats-input {
          width: 100%;
          padding: 10px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          text-align: center;
          font-weight: 600;
          font-family: inherit;
        }

        .stats-input::placeholder {
          color: var(--cricket-gray, #6b7280);
          opacity: 0.5;
        }

        .stats-input[type="number"]::-webkit-inner-spin-button,
        .stats-input[type="number"]::-webkit-outer-spin-button {
          opacity: 0.4;
          height: 24px;
        }

        /* ===== CHECKBOX ===== */
        .stats-checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: var(--cricket-cream, #f5f0e6);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }

        .stats-checkbox-wrap:hover {
          border-color: var(--cricket-gold, #c9a84c);
        }

        .stats-checkbox-wrap.checked {
          background: rgba(201, 168, 76, 0.1);
          border-color: var(--cricket-gold, #c9a84c);
        }

        .stats-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--cricket-gold, #c9a84c);
          cursor: pointer;
          flex-shrink: 0;
        }

        .stats-checkbox-label {
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          user-select: none;
        }

        /* ===== LIVE STATS PANEL ===== */
        .stats-live-panel {
          background: var(--cricket-cream, #f5f0e6);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.25rem 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          position: relative;
        }

        .stats-live-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--cricket-gold, #c9a84c);
          border-radius: 12px 12px 0 0;
        }

        .stats-live-item {
          text-align: center;
        }

        .stats-live-label {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.375rem;
        }

        .stats-live-value {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.5rem;
          font-weight: 800;
          transition: all 0.3s ease;
          font-variant-numeric: tabular-nums;
        }

        .stats-live-value.updating {
          animation: statPop 0.3s ease;
        }

        .stats-live-value.highlight {
          color: var(--cricket-gold, #c9a84c);
        }

        /* ===== SUBMIT BUTTON ===== */
        .stats-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 14px;
          background: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }

        .stats-submit:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .stats-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .stats-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .stats-submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--cricket-cream, #f5f0e6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ===== SCROLLBAR ===== */
        .stats-modal::-webkit-scrollbar {
          width: 6px;
        }

        .stats-modal::-webkit-scrollbar-track {
          background: transparent;
        }

        .stats-modal::-webkit-scrollbar-thumb {
          background: var(--cricket-border, #d4cec4);
          border-radius: 3px;
        }

        .stats-modal::-webkit-scrollbar-thumb:hover {
          background: var(--cricket-gray, #6b7280);
        }

        /* ===== MOBILE ===== */
        @media (max-width: 576px) {
          .stats-overlay {
            padding: 0.5rem;
            align-items: flex-end;
          }

          .stats-modal {
            border-radius: 12px 12px 0 0;
            max-height: 85vh;
          }

          .stats-header {
            padding: 1rem 1.25rem;
          }

          .stats-body {
            padding: 1rem 1.25rem;
          }

          .stats-player-avatar {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }

          .stats-header-text h5 {
            font-size: 0.9rem;
          }

          .stats-section-title {
            font-size: 0.85rem;
          }

          .stats-input {
            font-size: 16px; /* iOS zoom fix */
          }

          .stats-live-panel {
            padding: 1rem;
            margin: 1rem 0;
          }

          .stats-live-value {
            font-size: 1.25rem;
          }

          .stats-submit {
            padding: 16px;
            font-size: 1rem;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .stats-close-btn:active {
            transform: scale(0.95);
          }

          .stats-submit:active:not(:disabled) {
            transform: scale(0.98);
          }

          .stats-checkbox-wrap:active {
            background: rgba(201, 168, 76, 0.15);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .stats-overlay,
          .stats-modal.entering,
          .stats-modal.exiting,
          .stats-submit-spinner,
          .stats-live-value.updating {
            animation: none;
            transition: none;
          }
        }
      `}</style>

      <div className="stats-overlay" onClick={handleClose}>
        <div
          className={`stats-modal ${modalVisible ? 'entering' : 'exiting'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="stats-header">
            <div className="stats-header-info">
              <div className="stats-player-avatar">🏏</div>
              <div className="stats-header-text">
                <h5>Enter Stats — {player.name}</h5>
                <p>{player.role?.toUpperCase()} • Team ID: {teamId}</p>
              </div>
            </div>
            <button className="stats-close-btn" onClick={handleClose} aria-label="Close modal">×</button>
          </div>

          <div className="stats-body">
            <form onSubmit={submitStats}>
              <div className="stats-grid">
                {/* Batting Section */}
                <div className="stats-section">
                  <div className="stats-section-header">
                    <div className="stats-section-icon stats-batting-icon">🏏</div>
                    <h6 className="stats-section-title">Batting Stats</h6>
                  </div>
                  {statFields.batting.map((field) => (
                    <div className="stats-field" key={field.name} style={{ marginBottom: '0.625rem' }}>
                      <label className={`stats-field-label ${focusedField === field.name ? 'focused' : ''}`}>
                        <span className="stats-field-icon">{field.icon}</span>
                        {field.label}
                      </label>
                      <div className={`stats-input-wrap ${focusedField === field.name ? 'focused' : ''}`}>
                        <input
                          type="number"
                          name={field.name}
                          className="stats-input"
                          value={formData[field.name]}
                          onChange={handleChange}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => setFocusedField(null)}
                          step={field.step || 1}
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                  <div
                    className={`stats-checkbox-wrap ${formData.is_not_out ? 'checked' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, is_not_out: !prev.is_not_out }))}
                  >
                    <input
                      type="checkbox"
                      name="is_not_out"
                      className="stats-checkbox"
                      checked={formData.is_not_out}
                      onChange={handleChange}
                      onClick={e => e.stopPropagation()}
                    />
                    <label className="stats-checkbox-label">Not Out</label>
                  </div>
                </div>

                {/* Bowling Section */}
                <div className="stats-section">
                  <div className="stats-section-header">
                    <div className="stats-section-icon stats-bowling-icon">🎯</div>
                    <h6 className="stats-section-title">Bowling Stats</h6>
                  </div>
                  {statFields.bowling.map((field) => (
                    <div className="stats-field" key={field.name} style={{ marginBottom: '0.625rem' }}>
                      <label className={`stats-field-label ${focusedField === field.name ? 'focused' : ''}`}>
                        <span className="stats-field-icon">{field.icon}</span>
                        {field.label}
                      </label>
                      <div className={`stats-input-wrap ${focusedField === field.name ? 'focused' : ''}`}>
                        <input
                          type="number"
                          name={field.name}
                          className="stats-input"
                          value={formData[field.name]}
                          onChange={handleChange}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => setFocusedField(null)}
                          step={field.step || 1}
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Stats Panel */}
              <div className="stats-live-panel">
                <div className="stats-live-item">
                  <div className="stats-live-label">Strike Rate</div>
                  <div className={`stats-live-value ${calculated.strikeRate > 0 ? 'updating' : ''} ${parseFloat(calculated.strikeRate) > 100 ? 'highlight' : ''}`}>
                    {calculated.strikeRate}
                  </div>
                </div>
                <div className="stats-live-item">
                  <div className="stats-live-label">Run Rate</div>
                  <div className="stats-live-value">
                    {formData.overs_bowled > 0 ? (formData.runs / formData.overs_bowled).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="stats-submit"
                disabled={loading}
              >
                {loading && <div className="stats-submit-spinner"></div>}
                {loading ? "Saving..." : "Save Player Stats"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsModal;