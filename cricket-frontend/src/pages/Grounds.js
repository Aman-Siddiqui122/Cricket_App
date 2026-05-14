import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Karachi grounds with coordinates (lat, lng)
const KARACHI_GROUNDS = [
  { id: 1, name: 'National Stadium', location: 'Gulshan-e-Iqbal', lat: 24.8964, lng: 67.0556 },
  { id: 2, name: 'Asghar Ali Shah Stadium', location: 'Federal B Area', lat: 24.9180, lng: 67.0631 },
  { id: 3, name: 'KPT Sports Complex', location: 'Clifton', lat: 24.8138, lng: 67.0305 },
  { id: 4, name: 'Southend Club Cricket Stadium', location: 'Defence Housing Authority', lat: 24.7936, lng: 67.0583 },
  { id: 5, name: 'A.O. Cricket Stadium', location: 'Gulshan-e-Iqbal', lat: 24.9056, lng: 67.0822 },
  { id: 6, name: 'Karachi Gymkhana', location: 'Saddar', lat: 24.8484, lng: 67.0344 },
  { id: 7, name: 'Naya Nazimabad Cricket Ground', location: 'Naya Nazimabad', lat: 24.9372, lng: 66.9756 },
  { id: 8, name: 'TMC Ground', location: 'Korangi', lat: 24.8395, lng: 67.1328 },
  { id: 9, name: 'Landhi Gymkhana', location: 'Landhi', lat: 24.8206, lng: 67.1854 },
  { id: 10, name: 'KCCA Ground', location: 'Karachi Club', lat: 24.8607, lng: 67.0011 },
];

const Grounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | loading | success | error

  // Add Ground Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGround, setNewGround] = useState({
    name: '',
    location: '',
    description: '',
    latitude: '',
    longitude: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);

  // Load Leaflet CSS & JS dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    fetchGrounds();
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (showMap && window.L) {
      const timer = setTimeout(() => {
        const mapContainer = document.getElementById('ground-map');
        if (mapContainer && !mapContainer._leaflet_id) {
          const map = window.L.map('ground-map').setView([24.8607, 67.0011], 11);

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          // Add markers for known grounds
          KARACHI_GROUNDS.forEach((ground) => {
            const marker = window.L.marker([ground.lat, ground.lng]).addTo(map);
            marker.bindPopup(`
              <div style="font-family: system-ui; min-width: 160px;">
                <strong style="color: #1a2332; font-size: 13px;">${ground.name}</strong><br/>
                <span style="color: #6b7280; font-size: 11px;">📍 ${ground.location}</span><br/>
                <button 
                  onclick="window.selectGroundFromMap(${ground.lat}, ${ground.lng}, '${ground.location.replace(/'/g, "\'")}')"
                  style="margin-top: 6px; padding: 5px 10px; background: #c9a84c; color: #1a2332; border: none; border-radius: 5px; font-weight: 600; font-size: 11px; cursor: pointer;"
                >
                  Use This Location
                </button>
              </div>
            `);
          });

          // Allow clicking anywhere on map to set custom location
          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            // Reverse geocode would go here, but we'll use coordinates
            window.L.popup()
              .setLatLng(e.latlng)
              .setContent(`
                <div style="font-family: system-ui;">
                  <strong style="font-size: 12px;">Custom Location</strong><br/>
                  <span style="color: #6b7280; font-size: 11px;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</span><br/>
                  <button 
                    onclick="window.selectGroundFromMap(${lat}, ${lng}, 'Custom Location')"
                    style="margin-top: 6px; padding: 5px 10px; background: #1a2332; color: #f5f0e6; border: none; border-radius: 5px; font-weight: 600; font-size: 11px; cursor: pointer;"
                  >
                    Select Here
                  </button>
                </div>
              `)
              .openOn(map);
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showMap]);

  // Global function for popup buttons
  useEffect(() => {
    window.selectGroundFromMap = (lat, lng, locationName) => {
      setNewGround(prev => ({
        ...prev,
        latitude: String(lat),
        longitude: String(lng),
        location: locationName === 'Custom Location' ? prev.location || 'Custom Location' : locationName
      }));
      setSelectedMapLocation({ lat, lng, name: locationName });
      setShowMap(false);
    };
    return () => { delete window.selectGroundFromMap; };
  }, []);

  const fetchGrounds = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/grounds/');
      setGrounds(response.data);
    } catch (err) {
      setError("Failed to load grounds");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGrounds();
  };

  const handleAddGround = async (e) => {
    e.preventDefault();
    if (!newGround.name || !newGround.location) return;

    setSubmitStatus('loading');
    try {
      await api.post('/grounds/', newGround);
      setSubmitStatus('success');
      setTimeout(() => {
        setSubmitStatus('idle');
        setShowAddModal(false);
        setNewGround({ name: '', location: '', description: '', latitude: '', longitude: '' });
        setSelectedMapLocation(null);
        fetchGrounds();
      }, 1500);
    } catch (err) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const handleNewGroundChange = (e) => {
    setNewGround(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputIcon = (field) => {
    const icons = {
      name: '🏟️', location: '📍', description: '📝',
      latitude: '🌐', longitude: '🌐'
    };
    return icons[field] || '•';
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes mapSlideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes successPop {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }

        .grounds-page {
          position: relative;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        /* Header */
        .grounds-header {
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

        .grounds-header h2 {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .grounds-header h2::before {
          content: '🏟️';
          font-size: 1.4rem;
        }

        /* Header Actions */
        .grounds-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        /* Refresh Button */
        .grounds-refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          color: var(--cricket-navy, #1a2332);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .grounds-refresh-btn:hover {
          border-color: var(--cricket-gold, #c9a84c);
          color: var(--cricket-gold, #c9a84c);
          background: rgba(201, 168, 76, 0.06);
        }

        .grounds-refresh-btn:active {
          transform: translateY(0);
        }

        .grounds-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .grounds-refresh-btn.spinning .refresh-icon {
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        /* Add Ground Button */
        .grounds-add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--cricket-navy, #1a2332);
          border: 1.5px solid var(--cricket-navy, #1a2332);
          border-radius: 10px;
          color: var(--cricket-cream, #f5f0e6);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .grounds-add-btn:hover {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .grounds-add-btn:active {
          transform: translateY(0);
        }

        /* Loading State */
        .grounds-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          color: var(--cricket-gray, #6b7280);
        }

        .grounds-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--cricket-border, #d4cec4);
          border-top-color: var(--cricket-gold, #c9a84c);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.25rem;
        }

        /* Error State */
        .grounds-error {
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

        .grounds-error strong {
          font-weight: 700;
        }

        .grounds-error p {
          margin: 0;
          font-size: 0.9rem;
        }

        /* Grid */
        .grounds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .grounds-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Ground Card */
        .ground-card {
          position: relative;
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          opacity: 0;
          transform: translateY(16px);
          animation: cardEnter 0.4s ease-out backwards;
        }

        .ground-card.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .ground-card:hover {
          transform: translateY(-4px);
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .ground-card:active {
          transform: scale(0.99);
        }

        /* Card Header Image Area */
        .ground-card-header {
          height: 110px;
          background: var(--cricket-cream, #f5f0e6);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
        }

        .ground-card-header::before {
          content: '🏟️';
          font-size: 2.5rem;
          opacity: 0.25;
        }

        .ground-card-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30px;
          background: linear-gradient(to top, var(--cricket-white, #faf9f7), transparent);
        }

        /* Card Body */
        .ground-card-body {
          padding: 1.25rem;
        }

        .ground-name {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.625rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          line-height: 1.3;
        }

        .ground-location {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.85rem;
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
          margin-bottom: 0.625rem;
          line-height: 1.4;
        }

        .ground-location-icon {
          font-size: 1rem;
          margin-top: 1px;
          flex-shrink: 0;
        }

        .ground-desc {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.82rem;
          line-height: 1.5;
          margin-bottom: 0.875rem;
          opacity: 0.8;
        }

        /* Badge */
        .ground-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.75rem;
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.25);
          border-radius: 20px;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.78rem;
          font-weight: 600;
        }

        /* Card Footer */
        .ground-card-footer {
          padding: 0.875rem 1.25rem;
          background: var(--cricket-cream, #f5f0e6);
          border-top: 1px solid var(--cricket-border, #d4cec4);
        }

        .ground-view-btn {
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

        .ground-view-btn:hover {
          background: var(--cricket-navy, #1a2332);
          border-color: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          transform: translateY(-1px);
        }

        .ground-view-btn:active {
          transform: translateY(0);
        }

        /* Skeleton Cards */
        .ground-skeleton {
          background: var(--cricket-cream, #f5f0e6);
          border-radius: 14px;
          height: 260px;
          background-image: linear-gradient(90deg, var(--cricket-cream, #f5f0e6) 0%, var(--cricket-light-gray, #e5e0d8) 50%, var(--cricket-cream, #f5f0e6) 100%);
          background-size: 200% 100%;
          animation: skeleton 1.5s ease-in-out infinite;
          border: 1px solid var(--cricket-border, #d4cec4);
        }

        /* Empty State */
        .grounds-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--cricket-gray, #6b7280);
          animation: fadeIn 0.5s ease-out;
        }

        .grounds-empty-icon {
          font-size: 3rem;
          margin-bottom: 0.75rem;
          opacity: 0.35;
        }

        .grounds-empty h4 {
          color: var(--cricket-navy, #1a2332);
          margin-bottom: 0.5rem;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .grounds-empty p {
          font-size: 0.9rem;
          margin: 0;
          opacity: 0.7;
        }

        /* ===== MODAL ===== */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(26, 35, 50, 0.55);
          backdrop-filter: blur(4px);
          z-index: 1040;
          animation: backdropFade 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-dialog {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .modal-content {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.125rem 1.5rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
        }

        .modal-title {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--cricket-gray, #6b7280);
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.2s;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .modal-close:hover {
          color: var(--cricket-red, #b91c3c);
          background: rgba(185, 28, 60, 0.08);
        }

        .modal-body {
          padding: 1.5rem;
        }

        /* Modal Form */
        .modal-field {
          margin-bottom: 1rem;
        }

        .modal-label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--cricket-gray, #6b7280);
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .modal-label.focused {
          color: var(--cricket-navy, #1a2332);
        }

        .modal-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--cricket-white, #faf9f7);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          padding: 0 12px;
          transition: all 0.25s ease;
        }

        .modal-input-wrap.focused {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }

        .modal-input-icon {
          color: var(--cricket-gray, #6b7280);
          font-size: 15px;
          margin-right: 8px;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .modal-input-wrap.focused .modal-input-icon {
          color: var(--cricket-gold, #c9a84c);
        }

        .modal-input {
          width: 100%;
          padding: 11px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          font-family: inherit;
        }

        .modal-input::placeholder {
          color: var(--cricket-gray, #6b7280);
          opacity: 0.5;
        }

        .modal-textarea {
          width: 100%;
          padding: 11px 12px;
          background: transparent;
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          font-family: inherit;
          min-height: 80px;
          resize: vertical;
          transition: all 0.25s ease;
        }

        .modal-textarea:focus {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }

        /* Map Toggle in Modal */
        .modal-map-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: transparent;
          border: 1.5px dashed var(--cricket-border, #d4cec4);
          border-radius: 8px;
          color: var(--cricket-gray, #6b7280);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-map-toggle:hover {
          border-color: var(--cricket-gold, #c9a84c);
          color: var(--cricket-navy, #1a2332);
          background: rgba(201, 168, 76, 0.05);
        }

        .modal-map-container {
          margin-top: 0.75rem;
          border: 2px solid var(--cricket-border, #d4cec4);
          border-radius: 12px;
          overflow: hidden;
          animation: mapSlideDown 0.4s ease-out;
        }

        .modal-map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 1rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
        }

        .modal-map-header span {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--cricket-navy, #1a2332);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .modal-map-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: var(--cricket-gray, #6b7280);
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.2s;
        }

        .modal-map-close:hover {
          color: var(--cricket-red, #b91c3c);
        }

        .modal-map-box {
          height: 280px;
          width: 100%;
        }

        .modal-map-hint {
          padding: 0.5rem 1rem;
          background: rgba(201, 168, 76, 0.06);
          border-top: 1px solid var(--cricket-border, #d4cec4);
          font-size: 0.78rem;
          color: var(--cricket-gray, #6b7280);
          text-align: center;
        }

        .modal-location-picked {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--cricket-navy, #1a2332);
          animation: fadeIn 0.3s ease;
        }

        .modal-location-picked strong {
          color: var(--cricket-gold, #c9a84c);
        }

        /* Modal Submit Button */
        .modal-submit-btn {
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

        .modal-submit-btn:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .modal-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .modal-submit-btn-success {
          background: #1a5c3a !important;
          animation: successPop 0.4s ease-out;
        }

        .modal-submit-btn-error {
          background: var(--cricket-red, #b91c3c) !important;
          animation: shake 0.35s ease-in-out;
        }

        .modal-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--cricket-cream, #f5f0e6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .modal-toast {
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

        .modal-toast-error {
          background: rgba(185, 28, 60, 0.08);
          border: 1px solid rgba(185, 28, 60, 0.2);
          color: var(--cricket-red, #b91c3c);
        }

        /* Required asterisk */
        .modal-required {
          color: var(--cricket-red, #b91c3c);
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .grounds-header h2 {
            font-size: 1.4rem;
          }

          .grounds-header h2::before {
            font-size: 1.2rem;
          }

          .grounds-header-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .grounds-refresh-btn,
          .grounds-add-btn {
            padding: 0.5rem 0.875rem;
            font-size: 0.8rem;
          }

          .ground-card-header {
            height: 90px;
          }

          .ground-card-body {
            padding: 1rem;
          }

          .ground-name {
            font-size: 1rem;
          }

          .ground-card-footer {
            padding: 0.75rem 1rem;
          }

          .ground-view-btn {
            padding: 0.75rem;
            font-size: 0.85rem;
          }

          .grounds-loading {
            padding: 2rem 1rem;
          }

          .modal-dialog {
            max-width: 100%;
            max-height: 95vh;
          }

          .modal-body {
            padding: 1.25rem;
          }

          .modal-map-box {
            height: 220px;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .ground-card:active {
            transform: scale(0.98);
          }

          .grounds-refresh-btn:active,
          .grounds-add-btn:active {
            transform: scale(0.97);
          }

          .ground-view-btn:active {
            transform: scale(0.98);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .grounds-page *,
          .grounds-page *::before,
          .grounds-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="grounds-page">
        {/* Header */}
        <div className="grounds-header">
          <h2>Cricket Grounds in Karachi</h2>
          <div className="grounds-header-actions">
            <button
              className={`grounds-refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={loading}
            >
              <span className="refresh-icon">🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              className="grounds-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <span>➕</span>
              Add New Ground
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="grounds-error">
            <span>⚠️</span>
            <div>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !refreshing && (
          <div className="grounds-loading">
            <div className="grounds-loading-spinner"></div>
            <p>Loading grounds...</p>
          </div>
        )}

        {/* Grid */}
        <div className="grounds-grid">
          {loading && !grounds.length ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="ground-skeleton"></div>)
          ) : (
            grounds.map((ground, idx) => (
              <div
                key={ground.id}
                className={`ground-card ${pageLoaded ? 'loaded' : ''}`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="ground-card-header"></div>

                <div className="ground-card-body">
                  <h5 className="ground-name">
                    <span>🏟️</span>
                    {ground.name}
                  </h5>

                  <div className="ground-location">
                    <span className="ground-location-icon">📍</span>
                    <span>{ground.location}</span>
                  </div>

                  {ground.description && (
                    <p className="ground-desc">{ground.description}</p>
                  )}

                  <span className="ground-badge">
                    <span>📍</span> Karachi
                  </span>
                </div>

                <div className="ground-card-footer">
                  <button
                    className="ground-view-btn"
                    onClick={() => alert(`Showing matches at ${ground.name}`)}
                  >
                    <span>👁️</span>
                    View Matches Here
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {grounds.length === 0 && !loading && (
          <div className="grounds-empty">
            <div className="grounds-empty-icon">🏏</div>
            <h4>No Grounds Available</h4>
            <p>No cricket grounds found at the moment. Add your first ground!</p>
          </div>
        )}
      </div>

      {/* ===== ADD GROUND MODAL ===== */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddModal(false);
        }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">➕ Add New Ground</h5>
                <button 
                  type="button" 
                  className="modal-close"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddGround}>
                  {/* Ground Name */}
                  <div className="modal-field">
                    <label className={`modal-label ${focusedField === 'name' ? 'focused' : ''}`}>
                      Ground Name <span className="modal-required">*</span>
                    </label>
                    <div className={`modal-input-wrap ${focusedField === 'name' ? 'focused' : ''}`}>
                      <span className="modal-input-icon">{inputIcon('name')}</span>
                      <input
                        type="text"
                        name="name"
                        className="modal-input"
                        placeholder="e.g. National Stadium"
                        value={newGround.name}
                        onChange={handleNewGroundChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="modal-field">
                    <label className={`modal-label ${focusedField === 'location' ? 'focused' : ''}`}>
                      Location / Area <span className="modal-required">*</span>
                    </label>
                    <div className={`modal-input-wrap ${focusedField === 'location' ? 'focused' : ''}`}>
                      <span className="modal-input-icon">{inputIcon('location')}</span>
                      <input
                        type="text"
                        name="location"
                        className="modal-input"
                        placeholder="e.g. Gulshan-e-Iqbal, Karachi"
                        value={newGround.location}
                        onChange={handleNewGroundChange}
                        onFocus={() => setFocusedField('location')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  {/* Karachi Map Picker */}
                  <div className="modal-field">
                    <button 
                      type="button" 
                      className="modal-map-toggle"
                      onClick={() => setShowMap(!showMap)}
                    >
                      🗺️ {showMap ? 'Hide Karachi Map' : 'Pick Location from Karachi Map'}
                    </button>

                    {selectedMapLocation && (
                      <div className="modal-location-picked">
                        <span>✅</span>
                        <span>
                          Location set: <strong>{selectedMapLocation.name}</strong> 
                          ({selectedMapLocation.lat.toFixed(4)}, {selectedMapLocation.lng.toFixed(4)})
                        </span>
                      </div>
                    )}

                    {showMap && (
                      <div className="modal-map-container">
                        <div className="modal-map-header">
                          <span>🗺️ Click map or markers to set location</span>
                          <button 
                            type="button" 
                            className="modal-map-close"
                            onClick={() => setShowMap(false)}
                          >
                            ×
                          </button>
                        </div>
                        <div id="ground-map" className="modal-map-box"></div>
                        <div className="modal-map-hint">
                          📍 Click anywhere on the map or any marker to select coordinates
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="modal-field">
                    <label className={`modal-label ${focusedField === 'description' ? 'focused' : ''}`}>
                      Description <span style={{ color: 'var(--cricket-gray, #6b7280)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <textarea
                      name="description"
                      className="modal-textarea"
                      placeholder="Pitch type, facilities, capacity..."
                      value={newGround.description}
                      onChange={handleNewGroundChange}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      rows="3"
                    />
                  </div>

                  {/* Hidden coordinate fields (auto-filled from map) */}
                  {(newGround.latitude || newGround.longitude) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <label className="modal-label">Latitude</label>
                        <div className="modal-input-wrap">
                          <span className="modal-input-icon">🌐</span>
                          <input type="text" className="modal-input" value={newGround.latitude} readOnly />
                        </div>
                      </div>
                      <div>
                        <label className="modal-label">Longitude</label>
                        <div className="modal-input-wrap">
                          <span className="modal-input-icon">🌐</span>
                          <input type="text" className="modal-input" value={newGround.longitude} readOnly />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`modal-submit-btn ${submitStatus === 'success' ? 'modal-submit-btn-success' : ''} ${submitStatus === 'error' ? 'modal-submit-btn-error' : ''}`}
                    disabled={submitStatus === 'loading' || submitStatus === 'success'}
                  >
                    {submitStatus === 'loading' && <div className="modal-spinner" />}
                    {submitStatus === 'success' ? 'Ground Added!' :
                     submitStatus === 'error' ? 'Failed' :
                     submitStatus === 'loading' ? 'Adding...' : '➕ Add Ground'}
                  </button>

                  {submitStatus === 'error' && (
                    <div className="modal-toast modal-toast-error">
                      ⚠️ Failed to add ground. Please try again.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Grounds;
