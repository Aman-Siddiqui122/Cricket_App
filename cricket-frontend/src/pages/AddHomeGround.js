import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// ─── Fix Leaflet default icon ──────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const KARACHI_CENTER = [24.8607, 67.0011];
const DEFAULT_ZOOM   = 12;

// ─── Custom cricket-themed marker ───────────────────────────
const cricketMarkerIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:28px;height:28px">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(201,168,76,0.25);
        animation:markerPulse 1.6s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:absolute;inset:3px;border-radius:50%;
        background:var(--cricket-gold,#c9a84c);border:2px solid var(--cricket-white,#faf9f7);
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:6px;height:6px;background:var(--cricket-white,#faf9f7);border-radius:50%;
      "></div>
    </div>`,
  iconSize:   [28, 28],
  iconAnchor: [14, 14],
});

// ─── Hooks ─────────────────────────────────────────────────
function useFormState(initial) {
  const [values, setValues] = useState(initial);
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);
  return [values, handleChange];
}

// ─── Sub-components ──────────────────────────────────────
function MapClickHandler({ onSelect }) {
  useMapEvents({ click: (e) => onSelect(e.latlng) });
  return null;
}

function SelectedMarker({ position }) {
  if (!position) return null;
  return <Marker position={position} icon={cricketMarkerIcon} />;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="ahg-field-error" role="alert">{message}</p>;
}

function LocationBadge({ position }) {
  if (!position) return null;
  return (
    <div className="ahg-location-badge">
      <span className="ahg-location-badge__icon">📍</span>
      <span>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
const INITIAL_FORM = { name: '', location: '' };

const AddHomeGround = () => {
  const navigate = useNavigate();
  const [formData, handleChange] = useFormState(INITIAL_FORM);
  const [position, setPosition]   = useState(null);
  const [status, setStatus]       = useState('idle');
  const [errors, setErrors]       = useState({});
  const [pageLoaded, setPageLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validate = useCallback(() => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Ground name is required.';
    if (!position) next.position = 'Please click the map to select a location.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [formData.name, position]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    try {
      await api.post('/grounds/', {
        name:      formData.name.trim(),
        location:  formData.location.trim() || 'Karachi',
        latitude:  position.lat,
        longitude: position.lng,
      });
      setStatus('success');
      setTimeout(() => navigate('/my-team'), 1500);
    } catch (err) {
      console.error('[AddHomeGround] submit error:', err);
      setStatus('error');
    }
  }, [validate, formData, position, navigate]);

  const isLoading  = status === 'loading';
  const isSuccess  = status === 'success';
  const isDisabled = isLoading || isSuccess;

  return (
    <>
      <style>{`
        @keyframes markerPulse {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        .ahg-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          min-height: 100vh;
          position: relative;
          padding-bottom: 2rem;
        }

        /* Header */
        .ahg-header {
          position: relative;
          z-index: 1;
          margin-bottom: 1.5rem;
          animation: slideUp 0.5s ease-out;
        }

        .ahg-header h2 {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin: 0 0 0.375rem;
        }

        .ahg-header p {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.9rem;
          margin: 0;
        }

        /* Grid */
        .ahg-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 1.25rem;
          align-items: start;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 900px) {
          .ahg-grid { grid-template-columns: 1fr; }
        }

        /* Card */
        .ahg-card {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
          transform: translateY(16px);
        }

        .ahg-card.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .ahg-card:hover {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .ahg-card__header {
          padding: 0.875rem 1.25rem;
          background: var(--cricket-cream, #f5f0e6);
          border-bottom: 1px solid var(--cricket-border, #d4cec4);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cricket-navy, #1a2332);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ahg-card__body {
          padding: 1.25rem;
        }

        /* Form elements */
        .ahg-field {
          margin-bottom: 1rem;
        }

        .ahg-label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--cricket-gray, #6b7280);
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .ahg-label.focused {
          color: var(--cricket-navy, #1a2332);
        }

        .ahg-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--cricket-white, #faf9f7);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          padding: 0 12px;
          transition: all 0.25s ease;
        }

        .ahg-input-wrapper.focused {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }

        .ahg-input-wrapper.is-invalid {
          border-color: var(--cricket-red, #b91c3c);
          animation: shake 0.35s ease-in-out;
        }

        .ahg-input-icon {
          color: var(--cricket-gray, #6b7280);
          font-size: 15px;
          margin-right: 8px;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .ahg-input-wrapper.focused .ahg-input-icon {
          color: var(--cricket-gold, #c9a84c);
        }

        .ahg-input,
        .ahg-textarea {
          width: 100%;
          padding: 11px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          font-family: inherit;
        }

        .ahg-input::placeholder,
        .ahg-textarea::placeholder {
          color: var(--cricket-gray, #6b7280);
          opacity: 0.5;
        }

        .ahg-textarea {
          resize: vertical;
          min-height: 72px;
          padding: 11px 0;
        }

        .ahg-field-error {
          margin: 0.35rem 0 0;
          font-size: 0.78rem;
          color: var(--cricket-red, #b91c3c);
          display: flex;
          align-items: center;
          gap: 4px;
          animation: slideUp 0.25s ease-out;
        }

        /* Button */
        .ahg-btn {
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

        .ahg-btn:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .ahg-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .ahg-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .ahg-btn--success {
          background: #1a5c3a !important;
          color: var(--cricket-cream, #f5f0e6) !important;
          animation: successPop 0.4s ease-out;
        }

        .ahg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--cricket-cream, #f5f0e6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Toast */
        .ahg-toast {
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

        .ahg-toast--error {
          background: rgba(185, 28, 60, 0.08);
          border: 1px solid rgba(185, 28, 60, 0.2);
          color: var(--cricket-red, #b91c3c);
        }

        .ahg-toast--success {
          background: rgba(26, 35, 50, 0.06);
          border: 1px solid rgba(26, 35, 50, 0.15);
          color: var(--cricket-navy, #1a2332);
        }

        /* Map */
        .ahg-map-wrap {
          height: 400px;
        }

        .ahg-map-wrap .leaflet-container {
          height: 100%;
          width: 100%;
          background: var(--cricket-cream, #f5f0e6);
        }

        /* Location badge */
        .ahg-location-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--cricket-cream, #f5f0e6);
          border-top: 1px solid var(--cricket-border, #d4cec4);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--cricket-navy, #1a2332);
          font-variant-numeric: tabular-nums;
          animation: slideUp 0.25s ease-out;
        }

        .ahg-location-badge__icon {
          color: var(--cricket-gold, #c9a84c);
        }

        /* Map hint */
        .ahg-map-hint {
          padding: 0.75rem 1rem;
          background: rgba(201, 168, 76, 0.08);
          border-top: 1px solid rgba(201, 168, 76, 0.2);
          font-size: 0.85rem;
          color: var(--cricket-navy, #1a2332);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* Required asterisk */
        .ahg-required {
          color: var(--cricket-red, #b91c3c);
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .ahg-header h2 {
            font-size: 1.4rem;
          }

          .ahg-header p {
            font-size: 0.85rem;
          }

          .ahg-card__header {
            padding: 0.75rem 1rem;
            font-size: 0.72rem;
          }

          .ahg-card__body {
            padding: 1rem;
          }

          .ahg-input,
          .ahg-textarea {
            font-size: 16px; /* iOS zoom fix */
            padding: 13px 0;
          }

          .ahg-map-wrap {
            height: 320px;
          }

          .ahg-btn {
            padding: 15px;
            font-size: 0.95rem;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .ahg-btn:active:not(:disabled) {
            transform: scale(0.98);
          }

          .ahg-card:active {
            transform: scale(0.99);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ahg-page *,
          .ahg-page *::before,
          .ahg-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="ahg-page container py-4">
        {/* Header */}
        <div className="ahg-header">
          <h2>Add Home Ground</h2>
          <p>Fill in the details and pin your ground on the map.</p>
        </div>

        <div className="ahg-grid">
          {/* ── Form panel ── */}
          <div className={`ahg-card ${pageLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="ahg-card__header">
              <span>🏏</span> Ground Details
            </div>
            <div className="ahg-card__body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="ahg-field">
                  <label
                    htmlFor="ahg-name"
                    className={`ahg-label ${focusedField === 'name' ? 'focused' : ''}`}
                  >
                    Ground Name <span className="ahg-required">*</span>
                  </label>
                  <div className={`ahg-input-wrapper ${focusedField === 'name' ? 'focused' : ''} ${errors.name ? 'is-invalid' : ''}`}>
                    <span className="ahg-input-icon">🏟️</span>
                    <input
                      id="ahg-name"
                      type="text"
                      name="name"
                      className="ahg-input"
                      placeholder="e.g. My Cricket Academy"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isDisabled}
                      autoComplete="off"
                    />
                  </div>
                  <FieldError message={errors.name} />
                </div>

                <div className="ahg-field">
                  <label
                    htmlFor="ahg-location"
                    className={`ahg-label ${focusedField === 'location' ? 'focused' : ''}`}
                  >
                    Full Address
                  </label>
                  <div className={`ahg-input-wrapper ${focusedField === 'location' ? 'focused' : ''}`}>
                    <span className="ahg-input-icon">📍</span>
                    <textarea
                      id="ahg-location"
                      name="location"
                      className="ahg-textarea"
                      placeholder="Area, near landmark, Karachi"
                      value={formData.location}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isDisabled}
                    />
                  </div>
                </div>

                <FieldError message={errors.position} />

                <button
                  type="submit"
                  className={`ahg-btn ${isSuccess ? 'ahg-btn--success' : ''}`}
                  disabled={isDisabled}
                >
                  {isLoading && <div className="ahg-spinner" />}
                  {isSuccess ? 'Ground Saved!' : isLoading ? 'Saving…' : 'Save Home Ground'}
                </button>

                {status === 'error' && (
                  <div className="ahg-toast ahg-toast--error" role="alert">
                    ⚠️ Failed to save ground. Please try again.
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ── Map panel ── */}
          <div className={`ahg-card ${pageLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '0.2s' }}>
            <div className="ahg-card__header">
              <span>🗺️</span> Click to Pin Your Ground
            </div>

            <div className="ahg-map-wrap">
              <MapContainer
                center={KARACHI_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapClickHandler onSelect={setPosition} />
                <SelectedMarker position={position} />
              </MapContainer>
            </div>

            {position ? (
              <LocationBadge position={position} />
            ) : (
              <div className="ahg-map-hint">
                <span>💡</span> Tap anywhere on the map to drop a pin on your ground.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddHomeGround;