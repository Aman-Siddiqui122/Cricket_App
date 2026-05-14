import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { extractErrorMessage } from '../utils/errorUtils';

const Login = () => {

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardVisible, setCardVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setCardVisible(false);
      setTimeout(() => {
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setError(extractErrorMessage(err.response?.data?.detail, "Invalid email or password"));
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
          50% { transform: translateY(-12px) rotate(180deg); }
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          background: var(--cricket-navy, #1a2332);
        }

        /* Subtle background */
        .login-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.05;
        }

        .login-bg-ball {
          position: absolute;
          width: 300px;
          height: 300px;
          background: var(--cricket-red, #b91c3c);
          border-radius: 50%;
          bottom: -100px;
          right: -100px;
          filter: blur(80px);
        }

        /* Card */
        .login-card {
          position: relative;
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px) scale(0.97);
        }

        .login-card.entering {
          animation: slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .login-card.exiting {
          animation: slideDown 0.4s ease-out forwards;
        }

        .login-card-body {
          padding: 2.5rem 2rem;
        }

        /* Logo Area */
        .login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .login-cricket-ball {
          width: 64px;
          height: 64px;
          background: radial-gradient(circle at 35% 35%, #d4405e, var(--cricket-red, #b91c3c));
          border-radius: 50%;
          position: relative;
          box-shadow: 0 8px 20px rgba(185, 28, 60, 0.3);
          animation: ballBounce 2s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-ball-seam {
          width: 70%;
          height: 2.5px;
          background: rgba(255, 255, 255, 0.7);
          transform: rotate(-45deg);
          border-radius: 1px;
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-title {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.95rem;
        }

        /* Error */
        .login-error {
          background: rgba(185, 28, 60, 0.08);
          border: 1px solid rgba(185, 28, 60, 0.2);
          color: var(--cricket-red, #b91c3c);
          padding: 0.875rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 1.5rem;
          animation: shake 0.4s ease-in-out;
        }

        /* Inputs */
        .login-input-group {
          margin-bottom: 1.25rem;
        }

        .login-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--cricket-gray, #6b7280);
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-label.focused {
          color: var(--cricket-navy, #1a2332);
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--cricket-white, #faf9f7);
          border: 1.5px solid var(--cricket-border, #d4cec4);
          border-radius: 12px;
          padding: 0 16px;
          transition: all 0.25s ease;
        }

        .login-input-wrapper.focused {
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 0 0 4px rgba(201, 168, 76, 0.1);
        }

        .login-input-icon {
          color: var(--cricket-gray, #6b7280);
          font-size: 1.1rem;
          margin-right: 12px;
          transition: color 0.2s;
        }

        .login-input-wrapper.focused .login-input-icon {
          color: var(--cricket-gold, #c9a84c);
        }

        .login-input {
          width: 100%;
          padding: 14px 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cricket-navy, #1a2332);
          font-size: 1rem;
          font-family: inherit;
        }

        .login-input::placeholder {
          color: var(--cricket-gray, #6b7280);
          opacity: 0.5;
        }

        /* Button */
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 14px;
          background: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 1rem;
        }

        .login-btn:hover:not(:disabled) {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(26, 35, 50, 0.3);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--cricket-cream, #f5f0e6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Footer */
        .login-footer {
          margin-top: 2rem;
          text-align: center;
          color: var(--cricket-gray, #6b7280);
          font-size: 0.95rem;
        }

        .login-link {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
        }

        .login-link:hover {
          color: var(--cricket-gold, #c9a84c);
          text-decoration: underline;
        }

        /* ===== MOBILE ===== */
        @media (max-width: 576px) {
          .login-page {
            padding: 1rem;
          }

          .login-card {
            border-radius: 16px;
          }

          .login-card-body {
            padding: 2rem 1.5rem;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .login-input {
            font-size: 16px; /* iOS zoom fix */
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .login-btn:active:not(:disabled) {
            transform: scale(0.98);
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-bg">
          <div className="login-bg-ball"></div>
        </div>

        <div className={`login-card ${cardVisible ? 'entering' : 'exiting'}`}>
          <div className="login-card-body">
            <div className="login-logo">
              <div className="login-cricket-ball">
                <div className="login-ball-seam"></div>
              </div>
            </div>

            <div className="login-header">
              <h1 className="login-title">CRICZONE</h1>
              <p className="login-subtitle">Cricket Management System</p>
            </div>

            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="login-input-group">
                <label className={`login-label ${focusedField === 'email' || formData.email ? 'focused' : ''}`}>
                  Email Address
                </label>
                <div className={`login-input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                  <span className="login-input-icon">✉️</span>
                  <input
                    type="email"
                    name="email"
                    className="login-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label className={`login-label ${focusedField === 'password' || formData.password ? 'focused' : ''}`}>
                  Password
                </label>
                <div className={`login-input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                  <span className="login-input-icon">🔒</span>
                  <input
                    type="password"
                    name="password"
                    className="login-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading && <div className="login-spinner"></div>}
                {loading ? 'Authenticating...' : 'LOGIN'}
              </button>
            </form>

            <div className="login-footer">
              Don't have an account?{' '}
              <Link to="/signup" className="login-link">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;