import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { GiCricketBat } from 'react-icons/gi';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    {
      to: '/matches',
      icon: <FaCalendarAlt size={32} />,
      title: 'Upcoming Matches',
      desc: 'View ongoing and upcoming matches in Karachi',
      btn: 'View Matches',
      delay: '0.1s'
    },
    {
      to: '/grounds',
      icon: <FaMapMarkerAlt size={32} />,
      title: 'Cricket Grounds',
      desc: 'Explore best cricket grounds in Karachi',
      btn: 'See Grounds',
      delay: '0.2s'
    },
    {
      to: '/my-team',
      icon: <FaUsers size={32} />,
      title: 'My Team',
      desc: 'Manage your team and subscription',
      btn: 'Go to Team',
      delay: '0.3s'
    },
    {
      to: null,
      icon: <GiCricketBat size={32} />,
      title: 'Live Scores',
      desc: 'Coming Soon - Live Match Scoring',
      btn: 'Coming Soon',
      disabled: true,
      delay: '0.4s'
    }
  ];

  const featuredGrounds = [
    { name: 'National Stadium Karachi', area: 'Lyari', tag: 'International Standard' },
    { name: 'Southend Club', area: 'Clifton', tag: 'Very Popular' },
    { name: 'PCB Ground', area: 'North Nazimabad', tag: 'Professional' }
  ];

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

        @keyframes ballBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .home-page {
          position: relative;
          min-height: 100vh;
          padding-bottom: 3rem;
        }

        /* Hero Section */
        .home-hero {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2.5rem 1rem 1.5rem;
          margin-bottom: 1.5rem;
          animation: slideUp 0.5s ease-out;
        }

        .home-hero h1 {
          color: var(--cricket-navy, #1a2332);
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .home-hero h1 .cricket-ball {
          width: 40px;
          height: 40px;
          background: var(--cricket-red, #b91c3c);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(185, 28, 60, 0.3);
          animation: ballBounce 2s ease-in-out infinite;
          position: relative;
          flex-shrink: 0;
        }

        .home-hero h1 .cricket-ball::after {
          content: '';
          width: 70%;
          height: 2px;
          background: rgba(255, 255, 255, 0.7);
          transform: rotate(-45deg);
          border-radius: 1px;
        }

        .home-hero .lead {
          color: var(--cricket-gray, #6b7280);
          font-size: 1.05rem;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .home-hero .user-greeting {
          color: var(--cricket-navy, #1a2332);
          font-size: 1rem;
          margin-top: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: var(--cricket-cream, #f5f0e6);
          border-radius: 50px;
          border: 1px solid var(--cricket-border, #d4cec4);
          font-weight: 500;
        }

        .home-hero .user-greeting strong {
          font-weight: 700;
        }

        /* Quick Action Cards */
        .home-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          position: relative;
          z-index: 1;
          margin-bottom: 2.5rem;
        }

        .home-action-card {
          position: relative;
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
          transform: translateY(16px);
        }

        .home-action-card.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .home-action-card:hover {
          transform: translateY(-4px);
          border-color: var(--cricket-gold, #c9a84c);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .home-action-card:active {
          transform: scale(0.98);
        }

        .home-action-card.disabled {
          opacity: 0.55;
          pointer-events: none;
          filter: grayscale(0.6);
        }

        .home-action-body {
          padding: 1.5rem 1.25rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .home-action-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: var(--cricket-cream, #f5f0e6);
          font-size: 1.25rem;
          transition: all 0.3s ease;
          background: var(--cricket-navy, #1a2332);
        }

        .home-action-card:hover .home-action-icon {
          transform: scale(1.08);
          background: var(--cricket-gold, #c9a84c);
        }

        .home-action-title {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.375rem;
        }

        .home-action-desc {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.85rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .home-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.25s ease;
          border: none;
          cursor: pointer;
        }

        .home-action-btn.primary {
          background: var(--cricket-navy, #1a2332);
          color: var(--cricket-cream, #f5f0e6);
        }

        .home-action-btn.primary:hover {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 35, 50, 0.2);
        }

        .home-action-btn.outline {
          background: transparent;
          color: var(--cricket-gray, #6b7280);
          border: 1.5px solid var(--cricket-border, #d4cec4);
        }

        /* Featured Section */
        .home-featured {
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s ease-out 0.3s both;
        }

        .home-featured h4 {
          color: var(--cricket-navy, #1a2332);
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .home-featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 0.875rem;
        }

        .home-featured-card {
          background: var(--cricket-white, #faf9f7);
          border: 1px solid var(--cricket-border, #d4cec4);
          border-radius: 12px;
          padding: 1.125rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          cursor: pointer;
        }

        .home-featured-card:hover {
          border-color: var(--cricket-gold, #c9a84c);
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .home-featured-card:active {
          transform: scale(0.99);
        }

        .home-featured-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--cricket-cream, #f5f0e6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
          border: 1.5px solid var(--cricket-border, #d4cec4);
        }

        .home-featured-info h6 {
          color: var(--cricket-navy, #1a2332);
          font-weight: 700;
          margin-bottom: 0.2rem;
          font-size: 0.95rem;
        }

        .home-featured-info p {
          color: var(--cricket-gray, #6b7280);
          font-size: 0.82rem;
          margin: 0;
        }

        .home-featured-tag {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.25);
          border-radius: 20px;
          color: var(--cricket-navy, #1a2332);
          font-size: 0.72rem;
          font-weight: 600;
          margin-top: 0.4rem;
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .home-hero {
            padding: 1.5rem 1rem 1rem;
          }

          .home-hero h1 {
            font-size: 1.75rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .home-hero h1 .cricket-ball {
            width: 32px;
            height: 32px;
          }

          .home-hero .lead {
            font-size: 0.9rem;
          }

          .home-hero .user-greeting {
            font-size: 0.9rem;
            padding: 0.4rem 1rem;
          }

          .home-actions-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .home-action-body {
            padding: 1.25rem 1rem;
          }

          .home-action-icon {
            width: 48px;
            height: 48px;
          }

          .home-featured-grid {
            grid-template-columns: 1fr;
          }

          .home-featured-card {
            padding: 1rem;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .home-action-card:active {
            transform: scale(0.98);
          }

          .home-featured-card:active {
            transform: scale(0.98);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .home-page *,
          .home-page *::before,
          .home-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="home-page">
        {/* Hero */}
        <div className="home-hero">
          <h1>
            Welcome to
            <span className="cricket-ball"></span>
            Karachi Cricket
          </h1>
          <p className="lead">Find Grounds • Join Matches • Manage Your Team</p>
          {user.name && (
            <div className="user-greeting">
              <span>👋</span>
              Hello, <strong>{user.name}</strong>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="home-actions-grid">
          {quickActions.map((action, idx) => (
            action.to ? (
              <Link
                key={idx}
                to={action.to}
                className={`home-action-card ${pageLoaded ? 'loaded' : ''} ${action.disabled ? 'disabled' : ''}`}
                style={{ transitionDelay: action.delay }}
              >
                <div className="home-action-body">
                  <div className="home-action-icon">
                    {action.icon}
                  </div>
                  <h5 className="home-action-title">{action.title}</h5>
                  <p className="home-action-desc">{action.desc}</p>
                  <span className={`home-action-btn ${action.disabled ? 'outline' : 'primary'}`}>
                    {action.btn}
                    {!action.disabled && <span>→</span>}
                  </span>
                </div>
              </Link>
            ) : (
              <div
                key={idx}
                className={`home-action-card ${pageLoaded ? 'loaded' : ''} disabled`}
                style={{ transitionDelay: action.delay }}
              >
                <div className="home-action-body">
                  <div className="home-action-icon" style={{ opacity: 0.5 }}>
                    {action.icon}
                  </div>
                  <h5 className="home-action-title">{action.title}</h5>
                  <p className="home-action-desc">{action.desc}</p>
                  <span className="home-action-btn outline">{action.btn}</span>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Featured Grounds */}
        <div className="home-featured">
          <h4>⭐ Popular Grounds in Karachi</h4>
          <div className="home-featured-grid">
            {featuredGrounds.map((ground, idx) => (
              <div
                key={idx}
                className="home-featured-card"
                style={{ animation: `slideUp 0.45s ease-out ${0.4 + idx * 0.1}s both` }}
              >
                <div className="home-featured-icon">🏟️</div>
                <div className="home-featured-info">
                  <h6>{ground.name}</h6>
                  <p>{ground.area} • {ground.tag}</p>
                  <span className="home-featured-tag">Top Rated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;