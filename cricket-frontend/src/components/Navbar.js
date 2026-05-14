import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/',         label: 'Home' },
    { to: '/matches',  label: 'Matches' },
    { to: '/grounds',  label: 'Grounds' },
    { to: '/my-team',  label: 'My Team' },
    { to: '/join-team',label: 'Join Team' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          --navy:  #1a2332;
          --gold:  #c9a84c;
          --cream: #f5f0e6;
          --white: #faf9f7;
          --gray:  #6b7280;
          --border:#d4cec4;
          --red:   #b91c3c;
        }

        /* ── SHELL ─────────────────────────────────────── */
        .nb {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: var(--white);
          border-bottom: 1px solid var(--border);
          height: 62px;
          transition: box-shadow 0.3s, border-color 0.3s;
          animation: nbDrop 0.45s ease-out;
        }
        .nb.scrolled {
          box-shadow: 0 2px 14px rgba(0,0,0,0.07);
          border-bottom-color: var(--gold);
        }
        @keyframes nbDrop {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }

        /* ── CONTAINER ─────────────────────────────────── */
        .nb-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.25rem;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* ── BRAND ─────────────────────────────────────── */
        .nb-brand {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-family: 'EB Garamond', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--navy);
          text-decoration: none;
          letter-spacing: 0.01em;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .nb-brand:hover { color: var(--gold); }
        .nb-brand-dot {
          width: 5px; height: 5px;
          background: var(--gold);
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── PIPE NAV ──────────────────────────────────── */
        .nb-nav {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0;
        }

        /* pipe separator between items */
        .nb-nav li + li::before {
          content: '|';
          color: var(--border);
          font-size: 0.85rem;
          padding: 0 0.1rem;
          pointer-events: none;
          user-select: none;
        }

        .nb-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray);
          text-decoration: none;
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          transition: color 0.18s, background 0.18s;
          white-space: nowrap;
          position: relative;
        }
        .nb-link:hover {
          color: var(--navy);
          background: rgba(201,168,76,0.08);
        }
        .nb-link.active {
          color: var(--navy);
          font-weight: 600;
        }
        /* gold underline on active / hover */
        .nb-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%;
          width: 0; height: 2px;
          background: var(--gold);
          border-radius: 1px;
          transition: width 0.2s, left 0.2s;
        }
        .nb-link:hover::after,
        .nb-link.active::after {
          width: calc(100% - 1.1rem);
          left: 0.55rem;
        }

        /* ── USER AREA ─────────────────────────────────── */
        .nb-user {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }
        .nb-hi {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          color: var(--gray);
        }
        .nb-hi strong {
          color: var(--navy);
          font-weight: 600;
        }

        .nb-btn-logout {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.7rem;
          background: transparent;
          border: 1.5px solid var(--red);
          border-radius: 5px;
          color: var(--red);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          background: var(--red);
          color: var(--cream);
          transform: translateY(-1px);
        }

        .nb-btn-login {
          display: flex;
          align-items: center;
          padding: 0.35rem 0.85rem;
          background: var(--navy);
          border-radius: 5px;
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          transition: background 0.2s, transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .nb-btn-login:hover {
          background: #252f40;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(26,35,50,0.15);
        }

        /* ── TOGGLE ────────────────────────────────────── */
        .nb-toggle {
          display: none;
          width: 32px; height: 32px;
          background: transparent;
          border: 1.5px solid var(--border);
          border-radius: 5px;
          color: var(--navy);
          font-size: 0.85rem;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .nb-toggle.open,
        .nb-toggle:hover {
          border-color: var(--gold);
          color: var(--gold);
        }

        /* ── MOBILE DRAWER ─────────────────────────────── */
        .nb-drawer {
          display: none;
          position: absolute;
          top: 100%; left: 0; right: 0;
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 0.5rem 0.75rem 0.75rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          animation: drawerSlide 0.22s ease-out;
        }
        .nb-drawer.open { display: block; }

        @keyframes drawerSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* mobile: stacked links with pipes as separators */
        .nb-drawer .nb-link {
          display: block;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 6px;
          margin-bottom: 1px;
        }
        .nb-drawer .nb-link.active {
          background: rgba(201,168,76,0.12);
        }

        /* mobile pipe between stacked items */
        .nb-drawer-links {
          display: flex;
          flex-direction: column;
        }
        .nb-drawer-sep {
          height: 1px;
          background: var(--border);
          margin: 0.15rem 0.75rem;
          opacity: 0.5;
        }

        .nb-drawer-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
          padding-top: 0.6rem;
          border-top: 1px solid var(--border);
        }

        /* ── RESPONSIVE ────────────────────────────────── */
        @media (max-width: 768px) {
          .nb-nav   { display: none; }
          .nb-user  { display: none; }
          .nb-toggle { display: flex; }
        }
        @media (min-width: 769px) {
          .nb-drawer { display: none !important; }
        }
      `}</style>

      <nav className={`nb ${scrolled ? 'scrolled' : ''}`}>
        <div className="nb-wrap">

          {/* Brand */}
          <Link className="nb-brand" to="/">
            🏏
            Karachi Cricket
            <span className="nb-brand-dot" />
          </Link>

          {/* Desktop pipe nav */}
          <ul className="nb-nav">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link className={`nb-link ${isActive(link.to) ? 'active' : ''}`} to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop user */}
          <div className="nb-user">
            {token ? (
              <>
                <span className="nb-hi">Hi, <strong>{user.name?.split(' ')[0] || 'User'}</strong></span>
                <button className="nb-btn-logout" onClick={handleLogout}>
                  <FaSignOutAlt size={11} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nb-btn-login">Login</Link>
            )}
          </div>

{/* Mobile toggle */}
          <button
            className={`nb-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`nb-drawer ${menuOpen ? 'open' : ''}`} id="mobile-drawer">
          <nav className="nb-drawer-links" aria-label="Mobile navigation">
            {navLinks.map((link, i) => (
              <React.Fragment key={link.to}>
                {i > 0 && <div className="nb-drawer-sep" />}
                <Link
                  className={`nb-link ${isActive(link.to) ? 'active' : ''}`}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
          <div className="nb-drawer-user">
            {token ? (
              <>
                <span className="nb-hi">Hi, <strong>{user.name?.split(' ')[0] || 'User'}</strong></span>
                <button className="nb-btn-logout" onClick={handleLogout}>
                  <FaSignOutAlt size={11} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nb-btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Fixed navbar spacer */}
      <div style={{ height: '62px' }} />
    </>
  );
};

export default Navbar;