import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { extractErrorMessage } from '../utils/errorUtils';

const Signup = () => {

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/signup', formData);
      setSuccess(true);
      setTimeout(() => {
        setCardVisible(false);
        setTimeout(() => navigate('/login'), 500);
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err.response?.data?.detail, "Failed to create account. Try again."));
      setLoading(false);
    }
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        @keyframes ballBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(180deg); }
        }

        @keyframes successPop {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }

        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          background: var(--cricket-navy, #1a2332);
        }

        /* Subtle pitch lines background */
        .signup-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.04;
        }

        .signup-bg-line {
          position: absolute;
          left: 10%;
          width: 80%;
          height: 2px;
          background: var(--cricket-cream, #f5f0e6);
          border-radius: 1px;
        }

        .signup-bg-line:nth-child(1) { top: 20%; }
        .signup-bg-line:nth-child(2) { top: 50%; }
        .signup-bg-line:nth-child(3) { top: 80%; }

        /* Card */
        .signup-card {
          position: relative;
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px) scale(0.97);
        }

        .signup-card.entering {
          animation: slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .signup-card.exiting {
          animation: slideDown 0.4s ease-out forwards;
        }

        .signup-card-body {
          padding: 2rem 1.75rem;
        }

        /* Logo */
        .signup-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .signup-cricket-ball {
          width: 56px;
          height: 56px;
          background: radial-gradient(circle at 35% 35%, #d4405e, var(--cricket-red, #b91c3c));
          border-radius: 50%;
          position: relative;
          box-shadow: 0 4px 16px rgba(185, 28, 60, 0.25);
          animation: ballBounce 2s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-ball-seam {
          width: 70%;
          height: 2px;
          background: rgba(255, 255, 255, 0.6);
          transform: rotate(-45deg);
          border-radius: 1px;
        }

        /* Title */
        .signup-title {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 0.375rem;
          letter-spacing: -0.3px;
        }

        .signup-subtitle {
          color: var(--cricket-gray, #6b7280);
          text-align: center;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        /* Error */
        .signup-error {
          background: rgba(185, 28, 60, 0.08);
          border: 1px solid rgba(185, 28, 60, 0.2);
          color: var(--cricket-red, #b91c3c);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          animation: shake 0.4s ease-in-out;
        }

        .signup-error-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* Success */
        .signup-success {
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.25);
          color: var(--cricket-navy, #1a2332);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          animation: successPop 0.4s ease-out;
        }

        .signup-success-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        /* Input Group */
        .signup-input-group {
          margin-bottom: 1.25rem;
        }

        .signup-label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--cricket-gray, #6b7280);
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .signup-label.focused {
          color: var(--cricket-navy, #1a2332);
        }

        .signup-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--cricket-white, #faf9f7);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 10px;
          padding: 0 12px;
          transition: all 0.25s ease;
        }

        .signup-input-wrapper.focused {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }

        .signup-input-icon {
          color: var(--cricket-gray, #6b7280);
          font-size: 15px;
          margin-right: 8px;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .signup-input-wrapper.focused .signup-input-icon {
          color: var(--cricket-gold, #c9a84c);
        }

        .signup-input {
          width: 100%;
          padding: 12px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.95rem;
          font-family: inherit;
        }

        .signup-input::placeholder {
          color: var(--cricket-gray, #6b7280);
          opacity: 0.5;
        }

        /* Button */
        .signup-btn {
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
          position: relative;
          overflow: hidden;
        }

        .signup-btn:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.3);
        }

        .signup-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .signup-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .signup-btn.success {
          background: #1a5c3a !important;
        }

        .signup-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--cricket-cream, #f5f0e6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Divider */
        .signup-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.25rem 0;
          color: var(--cricket-gray, #6b7280);
          font-size: 0.85rem;
        }

        .signup-divider::before,
        .signup-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--cricket-border, #d4cec4);
        }

        /* Footer */
        .signup-footer {
          text-align: center;
          color: var(--cricket-gray, #6b7280);
          font-size: 0.9rem;
        }

        .signup-link {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.25s ease;
        }

        .signup-link:hover {
          color: var(--cricket-gold, #c9a84c);
          gap: 0.4rem;
        }

        .signup-link-arrow {
          transition: transform 0.25s ease;
        }

        .signup-link:hover .signup-link-arrow {
          transform: translateX(3px);
        }

        /* ===== MOBILE ===== */
        @media (max-width: 576px) {
          .signup-page {
            padding: 0.5rem;
            align-items: flex-end;
          }

          .signup-card {
            border-radius: 12px 12px 0 0;
            max-height: 95vh;
            overflow-y: auto;
          }

          .signup-card-body {
            padding: 1.5rem 1.25rem;
          }

          .signup-title {
            font-size: 1.3rem;
          }

          .signup-cricket-ball {
            width: 48px;
            height: 48px;
          }

          .signup-input {
            font-size: 16px; /* iOS zoom fix */
            padding: 14px 0;
          }

          .signup-btn {
            padding: 15px;
            font-size: 0.95rem;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .signup-btn:active:not(:disabled) {
            transform: scale(0.98);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .signup-page *,
          .signup-page *::before,
          .signup-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="signup-page">
        {/* Subtle background */}
        <div className="signup-bg">
          <div className="signup-bg-line"></div>
          <div className="signup-bg-line"></div>
          <div className="signup-bg-line"></div>
        </div>

        <div className={`signup-card ${cardVisible ? 'entering' : 'exiting'}`}>
          <div className="signup-card-body">
            {/* Logo */}
            <div className="signup-logo">
              <div className="signup-cricket-ball">
                <div className="signup-ball-seam"></div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="signup-title">Karachi Cricket</h2>
              <p className="signup-subtitle">Join the community</p>
            </div>

            {/* Error */}
            {error && (
              <div className="signup-error">
                <span className="signup-error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="signup-success">
                <span className="signup-success-icon">✅</span>
                Account created! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSignup}>
              {/* Name */}
              <div className="signup-input-group">
                <label className={`signup-label ${focusedField === 'name' || formData.name ? 'focused' : ''}`}>
                  Full Name
                </label>
                <div className={`signup-input-wrapper ${focusedField === 'name' ? 'focused' : ''}`}>
                  <span className="signup-input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    className="signup-input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="signup-input-group">
                <label className={`signup-label ${focusedField === 'email' || formData.email ? 'focused' : ''}`}>
                  Email Address
                </label>
                <div className={`signup-input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                  <span className="signup-input-icon">✉️</span>
                  <input
                    type="email"
                    name="email"
                    className="signup-input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="signup-input-group">
                <label className={`signup-label ${focusedField === 'phone' || formData.phone ? 'focused' : ''}`}>
                  Phone Number
                </label>
                <div className={`signup-input-wrapper ${focusedField === 'phone' ? 'focused' : ''}`}>
                  <span className="signup-input-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    className="signup-input"
                    placeholder="03xx-xxxxxxx"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="signup-input-group">
                <label className={`signup-label ${focusedField === 'password' || formData.password ? 'focused' : ''}`}>
                  Password
                </label>
                <div className={`signup-input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                  <span className="signup-input-icon">🔒</span>
                  <input
                    type="password"
                    name="password"
                    className="signup-input"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                className={`signup-btn ${success ? 'success' : ''}`}
                disabled={loading || success}
              >
                {loading && <div className="signup-btn-spinner"></div>}
                {loading ? "Creating Account..." : success ? "Success!" : "SIGN UP"}
              </button>
            </form>

            {/* Divider */}
            <div className="signup-divider">
              <span>or</span>
            </div>

            {/* Footer */}
            <div className="signup-footer">
              Already have an account?{' '}
              <Link to="/login" className="signup-link">
                Login Here
                <span className="signup-link-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;