import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// Upper-level constant grounds (same as Grounds.js)
const KARACHI_GROUNDS = [
  { id: 'k1', name: 'National Stadium', location: 'Gulshan-e-Iqbal' },
  { id: 'k2', name: 'Asghar Ali Shah Stadium', location: 'Federal B Area' },
  { id: 'k3', name: 'KPT Sports Complex', location: 'Clifton' },
  { id: 'k4', name: 'Southend Club Cricket Stadium', location: 'Defence Housing Authority' },
  { id: 'k5', name: 'A.O. Cricket Stadium', location: 'Gulshan-e-Iqbal' },
  { id: 'k6', name: 'Karachi Gymkhana', location: 'Saddar' },
  { id: 'k7', name: 'Naya Nazimabad Cricket Ground', location: 'Naya Nazimabad' },
  { id: 'k8', name: 'TMC Ground', location: 'Korangi' },
  { id: 'k9', name: 'Landhi Gymkhana', location: 'Landhi' },
  { id: 'k10', name: 'KCCA Ground', location: 'Karachi Club' },
];

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Create Match Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myTeam, setMyTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [myGrounds, setMyGrounds] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const [matchForm, setMatchForm] = useState({
    team2_id: '',
    ground_id: '',
    ground_name: '',
    ground_source: '', // 'my' | 'karachi'
    match_date: '',
    match_time: '',
    overs_per_inning: '20',
  });

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

  const openCreateModal = async () => {
    setShowCreateModal(true);
    setMatchForm({ team2_id: '', ground_id: '', ground_name: '', ground_source: '', match_date: '', match_time: '', overs_per_inning: '20' });
    setCreateError('');
    setModalLoading(true);
    try {
      const [teamRes, teamsRes, groundsRes] = await Promise.all([
        api.get('/teams/my-team'),
        api.get('/teams/'),
        api.get('/grounds/'),
      ]);
      setMyTeam(teamRes.data);
      // Exclude own team from opponent list
      setAllTeams((teamsRes.data || []).filter(t => t.id !== teamRes.data.id));
      setMyGrounds(groundsRes.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setCreateError("You don't have a team yet. Please create your team first.");
      } else {
        setCreateError("Failed to load teams/grounds. Please try again.");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleGroundSelect = (ground, source) => {
    setMatchForm(prev => ({ 
      ...prev, 
      ground_id: ground.id, 
      ground_name: ground.name, 
      ground_source: source 
    }));
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!myTeam) return;
    if (!matchForm.team2_id) { setCreateError("Please select an opponent team."); return; }
    if (!matchForm.ground_id) { setCreateError("Please select a ground."); return; }

    setCreateLoading(true);
    setCreateError('');
    try {
      await api.post('/matches/', {
        team1_id: myTeam.id,
        team2_id: parseInt(matchForm.team2_id),
        ground_id: matchForm.ground_id,
        match_date: matchForm.match_date,
        match_time: matchForm.match_time,
        overs_per_inning: parseInt(matchForm.overs_per_inning),
      });
      setShowCreateModal(false);
      fetchMatches();
    } catch (err) {
      const msg = err.response?.data?.detail;
      setCreateError(typeof msg === 'string' ? msg : "Failed to create match. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const normalized = status?.toLowerCase() || 'scheduled';
    const styles = {
      live: { bg: 'rgba(185, 28, 60, 0.08)', color: 'var(--cricket-red, #b91c3c)', border: 'rgba(185, 28, 60, 0.2)', live: true },
      scheduled: { bg: 'rgba(59, 130, 246, 0.08)', color: '#2563eb', border: 'rgba(59, 130, 246, 0.2)', live: false },
      completed: { bg: 'rgba(107, 114, 128, 0.08)', color: 'var(--cricket-gray, #6b7280)', border: 'rgba(107, 114, 128, 0.2)', live: false },
      cancelled: { bg: 'rgba(185, 28, 60, 0.08)', color: 'var(--cricket-red, #b91c3c)', border: 'rgba(185, 28, 60, 0.2)', live: false },
    };
    return styles[normalized] || styles.scheduled;
  };

  // Merge my grounds + karachi grounds, deduplicate by name
  const myGroundNames = new Set(myGrounds.map(g => g.name.toLowerCase()));
  const filteredKarachiGrounds = KARACHI_GROUNDS.filter(g => !myGroundNames.has(g.name.toLowerCase()));

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
        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Page ── */
        .matches-page {
          position: relative;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        /* ── Header ── */
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
        .matches-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        /* ── Refresh Button ── */
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
        .matches-refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .matches-refresh-btn.spinning .refresh-icon {
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        /* ── Create Match Button ── */
        .matches-create-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: var(--cricket-navy, #1a2332);
          border: 1.5px solid var(--cricket-navy, #1a2332);
          border-radius: 10px;
          color: var(--cricket-cream, #f5f0e6);
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .matches-create-btn:hover {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }
        .matches-create-btn:active { transform: translateY(0); }

        /* ── Loading ── */
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

        /* ── Error Banner ── */
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
        .matches-error strong { font-weight: 700; }
        .matches-error p { margin: 0; font-size: 0.9rem; }

        /* ── Grid ── */
        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .matches-grid { grid-template-columns: 1fr; }
        }

        /* ── Match Card ── */
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
        .match-card.loaded { opacity: 1; transform: translateY(0); }
        .match-card:hover {
          transform: translateY(-4px);
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        .match-card:active { transform: scale(0.99); }

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
        .match-ground-icon { font-size: 1.1rem; }

        .match-card-body { padding: 1.25rem; flex: 1; }
        .match-teams {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          margin-bottom: 0.875rem;
          flex-wrap: wrap;
        }
        .match-team { color: var(--cricket-navy, #1a2332); font-weight: 700; font-size: 1rem; }
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
        .match-meta span { display: flex; align-items: center; gap: 0.4rem; }
        .match-overs {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.7;
        }
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
        .match-card-footer { padding: 0.875rem 1.25rem; border-top: 1px solid var(--cricket-border, #d4cec4); }
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
        .match-view-btn:active { transform: translateY(0); }

        /* ── Empty State ── */
        .matches-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--cricket-gray, #6b7280);
          animation: fadeIn 0.5s ease-out;
        }
        .matches-empty-icon { font-size: 3rem; margin-bottom: 0.75rem; opacity: 0.35; }
        .matches-empty h4 { color: var(--cricket-navy, #1a2332); margin-bottom: 0.5rem; font-weight: 700; font-size: 1.1rem; }
        .matches-empty p { font-size: 0.9rem; margin: 0; opacity: 0.7; }

        /* ── Skeleton ── */
        .match-skeleton {
          height: 200px;
          background: var(--cricket-cream, #f5f0e6);
          border-radius: 14px;
          background-image: linear-gradient(90deg, var(--cricket-cream, #f5f0e6) 0%, var(--cricket-light-gray, #e5e0d8) 50%, var(--cricket-cream, #f5f0e6) 100%);
          background-size: 200% 100%;
          animation: skeleton 1.5s ease-in-out infinite;
          border: 1px solid var(--cricket-border, #d4cec4);
        }

        /* ══════════════════════════════════
           CREATE MATCH MODAL
        ══════════════════════════════════ */
        .cm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(26, 35, 50, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1040;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: backdropFade 0.3s ease;
        }

        .cm-dialog {
          width: 100%;
          max-width: 540px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 16px;
          animation: modalIn 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .cm-content {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 16px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.16);
          overflow: hidden;
        }

        /* Modal header */
        .cm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.125rem 1.5rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
        }
        .cm-title {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cm-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--cricket-gray, #6b7280);
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
          line-height: 1;
        }
        .cm-close:hover {
          color: var(--cricket-red, #b91c3c);
          background: rgba(185,28,60,0.08);
          transform: rotate(90deg);
        }

        /* Modal body */
        .cm-body { padding: 1.5rem; }

        /* Team 1 badge */
        .cm-team1-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.25);
          border-radius: 10px;
          margin-bottom: 1.25rem;
        }
        .cm-team1-badge .badge-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          background: var(--cricket-cream, #f5f0e6);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cm-team1-badge .badge-label {
          font-size: 0.75rem;
          color: var(--cricket-gray, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .cm-team1-badge .badge-name {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          font-size: 0.95rem;
        }

        /* Field */
        .cm-field { margin-bottom: 1.125rem; }
        .cm-label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--cricket-gray, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          transition: color 0.2s;
        }
        .cm-label.focused { color: var(--cricket-navy, #1a2332); }
        .cm-required { color: var(--cricket-red, #b91c3c); }

        .cm-input-wrap {
          display: flex;
          align-items: center;
          background: var(--cricket-white, #faf9f7);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          padding: 0 12px;
          transition: all 0.25s ease;
        }
        .cm-input-wrap.focused {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }
        .cm-input-icon {
          color: var(--cricket-gray, #6b7280);
          font-size: 15px;
          margin-right: 8px;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .cm-input-wrap.focused .cm-input-icon { color: var(--cricket-gold, #c9a84c); }
        .cm-input, .cm-select {
          width: 100%;
          padding: 11px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          font-family: inherit;
        }
        .cm-select { cursor: pointer; }
        .cm-input::placeholder { color: var(--cricket-gray, #6b7280); opacity: 0.5; }

        /* Two-column row */
        .cm-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
        }
        @media (max-width: 480px) {
          .cm-row-2 { grid-template-columns: 1fr; }
        }

        /* Ground picker section */
        .cm-ground-section {
          margin-bottom: 1.125rem;
        }
        .cm-ground-section-title {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--cricket-gray, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* Ground tabs */
        .cm-ground-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .cm-ground-tab {
          flex: 1;
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 8px;
          color: var(--cricket-gray, #6b7280);
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        .cm-ground-tab:hover {
          border-color: var(--cricket-gold, #c9a84c);
          color: var(--cricket-navy, #1a2332);
        }
        .cm-ground-tab.active {
          background: var(--cricket-navy, #1a2332);
          border-color: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
        }

        /* Ground list */
        .cm-ground-list {
          max-height: 160px;
          overflow-y: auto;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          background: var(--cricket-white, #faf9f7);
        }
        .cm-ground-list::-webkit-scrollbar { width: 4px; }
        .cm-ground-list::-webkit-scrollbar-track { background: transparent; }
        .cm-ground-list::-webkit-scrollbar-thumb { background: var(--cricket-border, #d4cec4); border-radius: 4px; }

        .cm-ground-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          cursor: pointer;
          transition: background 0.15s ease;
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
        }
        .cm-ground-item:last-child { border-bottom: none; }
        .cm-ground-item:hover { background: rgba(201,168,76,0.06); }
        .cm-ground-item.selected {
          background: rgba(201,168,76,0.1);
          border-left: 3px solid var(--cricket-gold, #c9a84c);
        }
        .cm-ground-item-name {
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.88rem;
        }
        .cm-ground-item-loc {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.78rem;
          margin-top: 0.1rem;
        }
        .cm-ground-item-check {
          margin-left: auto;
          color: var(--cricket-gold, #c9a84c);
          font-size: 1rem;
          flex-shrink: 0;
        }
        .cm-ground-empty {
          padding: 1rem;
          text-align: center;
          color: var(--cricket-gray, #6b7280);
          font-size: 0.85rem;
        }

        /* Selected ground pill */
        .cm-ground-selected-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--cricket-navy, #1a2332);
          margin-top: 0.5rem;
          animation: fadeIn 0.3s ease;
        }
        .cm-ground-selected-pill strong { color: var(--cricket-gold, #c9a84c); }

        /* Modal error */
        .cm-error {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: rgba(185,28,60,0.08);
          border: 1px solid rgba(185,28,60,0.2);
          border-radius: 10px;
          color: var(--cricket-red, #b91c3c);
          font-size: 0.85rem;
          margin-bottom: 1rem;
          animation: shake 0.4s ease-in-out;
        }

        /* Modal loading */
        .cm-modal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          color: var(--cricket-gray, #6b7280);
          gap: 1rem;
        }
        .cm-modal-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--cricket-border, #d4cec4);
          border-top-color: var(--cricket-gold, #c9a84c);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Submit button */
        .cm-submit-btn {
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
          letter-spacing: 0.4px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }
        .cm-submit-btn:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26,35,50,0.2);
        }
        .cm-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .cm-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--cricket-cream, #f5f0e6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Divider */
        .cm-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0.25rem 0 1.125rem;
          color: var(--cricket-gray, #6b7280);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .cm-divider::before, .cm-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--cricket-border, #d4cec4);
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .matches-header h2 { font-size: 1.4rem; }
          .matches-header-actions { flex-wrap: wrap; }
          .matches-refresh-btn, .matches-create-btn { padding: 0.5rem 1rem; font-size: 0.8rem; }
          .match-card-header, .match-card-footer { padding: 0.75rem 1rem; }
          .match-card-body { padding: 1rem; }
          .match-team { font-size: 0.9rem; }
          .cm-dialog { max-width: 100%; border-radius: 12px 12px 0 0; align-self: flex-end; }
          .cm-backdrop { align-items: flex-end; padding: 0; }
          .cm-body { padding: 1.25rem; }
          .cm-header { padding: 1rem 1.25rem; }
        }

        /* Touch feedback */
        @media (hover: none) {
          .match-card:active { transform: scale(0.98); }
          .matches-refresh-btn:active, .matches-create-btn:active { transform: scale(0.97); }
          .match-view-btn:active { transform: scale(0.98); }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .matches-page *, .matches-page *::before, .matches-page *::after,
          .cm-backdrop *, .cm-backdrop *::before, .cm-backdrop *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="matches-page">
        {/* ── Header ── */}
        <div className="matches-header">
          <h2>🏏 Upcoming Matches</h2>
          <div className="matches-header-actions">
            <button
              className={`matches-refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={loading}
            >
              <span className="refresh-icon">🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="matches-create-btn" onClick={openCreateModal}>
              <span>➕</span> Create Match
            </button>
          </div>
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

        {/* ── Matches Grid ── */}
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
                      style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
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
                    <button className="match-view-btn" onClick={() => navigate(`/matches/${match.id}`)}>
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

      {/* ══════════════════════════════════
          CREATE MATCH MODAL
      ══════════════════════════════════ */}
      {showCreateModal && (
        <div className="cm-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="cm-dialog">
            <div className="cm-content">

              {/* Header */}
              <div className="cm-header">
                <h5 className="cm-title">🏏 Create New Match</h5>
                <button className="cm-close" onClick={() => setShowCreateModal(false)}>×</button>
              </div>

              <div className="cm-body">
                {/* ── Loading state ── */}
                {modalLoading ? (
                  <div className="cm-modal-loading">
                    <div className="cm-modal-spinner"></div>
                    <p>Loading teams & grounds...</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateMatch}>

                    {/* Error */}
                    {createError && (
                      <div className="cm-error">
                        <span>⚠️</span>
                        <span>{createError}</span>
                      </div>
                    )}

                    {/* Team 1 — auto-filled */}
                    {myTeam && (
                      <>
                        <div className="cm-label" style={{ marginBottom: '0.375rem' }}>YOUR TEAM (TEAM 1)</div>
                        <div className="cm-team1-badge" style={{ marginBottom: '1.25rem' }}>
                          <div className="badge-icon">👑</div>
                          <div>
                            <div className="badge-label">Captain / Team Leader</div>
                            <div className="badge-name">{myTeam.name}</div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="cm-divider">Match Details</div>

                    {/* Opponent Team */}
                    <div className="cm-field">
                      <label className={`cm-label ${focusedField === 'team2' ? 'focused' : ''}`}>
                        Opponent Team <span className="cm-required">*</span>
                      </label>
                      <div className={`cm-input-wrap ${focusedField === 'team2' ? 'focused' : ''}`}>
                        <span className="cm-input-icon">🏏</span>
                        <select
                          className="cm-select"
                          value={matchForm.team2_id}
                          onChange={e => setMatchForm(prev => ({ ...prev, team2_id: e.target.value }))}
                          onFocus={() => setFocusedField('team2')}
                          onBlur={() => setFocusedField(null)}
                          required
                        >
                          <option value="">— Select opponent team —</option>
                          {allTeams.length === 0 ? (
                            <option disabled>No other teams found</option>
                          ) : (
                            allTeams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="cm-row-2">
                      <div className="cm-field">
                        <label className={`cm-label ${focusedField === 'date' ? 'focused' : ''}`}>
                          Match Date <span className="cm-required">*</span>
                        </label>
                        <div className={`cm-input-wrap ${focusedField === 'date' ? 'focused' : ''}`}>
                          <span className="cm-input-icon">📅</span>
                          <input
                            type="date"
                            className="cm-input"
                            value={matchForm.match_date}
                            onChange={e => setMatchForm(prev => ({ ...prev, match_date: e.target.value }))}
                            onFocus={() => setFocusedField('date')}
                            onBlur={() => setFocusedField(null)}
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div className="cm-field">
                        <label className={`cm-label ${focusedField === 'time' ? 'focused' : ''}`}>
                          Match Time <span className="cm-required">*</span>
                        </label>
                        <div className={`cm-input-wrap ${focusedField === 'time' ? 'focused' : ''}`}>
                          <span className="cm-input-icon">🕒</span>
                          <input
                            type="time"
                            className="cm-input"
                            value={matchForm.match_time}
                            onChange={e => setMatchForm(prev => ({ ...prev, match_time: e.target.value }))}
                            onFocus={() => setFocusedField('time')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Overs */}
                    <div className="cm-field">
                      <label className={`cm-label ${focusedField === 'overs' ? 'focused' : ''}`}>
                        Overs Per Innings
                      </label>
                      <div className={`cm-input-wrap ${focusedField === 'overs' ? 'focused' : ''}`}>
                        <span className="cm-input-icon">🏏</span>
                        <select
                          className="cm-select"
                          value={matchForm.overs_per_inning}
                          onChange={e => setMatchForm(prev => ({ ...prev, overs_per_inning: e.target.value }))}
                          onFocus={() => setFocusedField('overs')}
                          onBlur={() => setFocusedField(null)}
                        >
                          {[5, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50].map(o => (
                            <option key={o} value={o}>{o} Overs</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* ── Ground Picker ── */}
                    <div className="cm-divider">Select Ground</div>

                    <div className="cm-ground-section">
                      {/* Tabs: My Grounds / Karachi Grounds */}
                      <div className="cm-ground-tabs">
                        <button
                          type="button"
                          className={`cm-ground-tab ${matchForm.ground_source !== 'karachi' ? 'active' : ''}`}
                          onClick={() => setMatchForm(prev => ({ ...prev, ground_source: 'my', ground_name: '' }))}
                        >
                          🏟️ My Grounds ({myGrounds.length})
                        </button>
                        <button
                          type="button"
                          className={`cm-ground-tab ${matchForm.ground_source === 'karachi' ? 'active' : ''}`}
                          onClick={() => setMatchForm(prev => ({ ...prev, ground_source: 'karachi', ground_name: '' }))}
                        >
                          📍 Karachi Grounds ({filteredKarachiGrounds.length})
                        </button>
                      </div>

                      {/* Ground list */}
                      <div className="cm-ground-list">
                        {matchForm.ground_source === 'karachi' ? (
                          filteredKarachiGrounds.length === 0 ? (
                            <div className="cm-ground-empty">All Karachi grounds are already in your list</div>
                          ) : (
                            filteredKarachiGrounds.map(g => (
                              <div
                                key={g.id}
                                className={`cm-ground-item ${matchForm.ground_name === g.name ? 'selected' : ''}`}
                                onClick={() => handleGroundSelect(g, 'karachi')}
                              >
                                <span style={{ fontSize: '1.2rem' }}>🏟️</span>
                                <div>
                                  <div className="cm-ground-item-name">{g.name}</div>
                                  <div className="cm-ground-item-loc">📍 {g.location}</div>
                                </div>
                                {matchForm.ground_name === g.name && (
                                  <span className="cm-ground-item-check">✅</span>
                                )}
                              </div>
                            ))
                          )
                        ) : (
                          myGrounds.length === 0 ? (
                            <div className="cm-ground-empty">
                              No grounds added yet. Switch to Karachi Grounds or add one in the Grounds section.
                            </div>
                          ) : (
                            myGrounds.map(g => (
                              <div
                                key={g.id}
                                className={`cm-ground-item ${matchForm.ground_name === g.name ? 'selected' : ''}`}
                                onClick={() => handleGroundSelect(g, 'my')}
                              >
                                <span style={{ fontSize: '1.2rem' }}>🏟️</span>
                                <div>
                                  <div className="cm-ground-item-name">{g.name}</div>
                                  {g.location && <div className="cm-ground-item-loc">📍 {g.location}</div>}
                                </div>
                                {matchForm.ground_name === g.name && (
                                  <span className="cm-ground-item-check">✅</span>
                                )}
                              </div>
                            ))
                          )
                        )}
                      </div>

                      {/* Selected ground confirmation */}
                      {matchForm.ground_name && (
                        <div className="cm-ground-selected-pill">
                          <span>🏟️</span>
                          <span>Ground: <strong>{matchForm.ground_name}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="cm-submit-btn"
                      disabled={createLoading || !myTeam}
                    >
                      {createLoading ? (
                        <><div className="cm-btn-spinner" /> Creating Match...</>
                      ) : (
                        <>🏏 Create Match</>
                      )}
                    </button>

                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Matches;