import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Matches from './pages/Matches';
import Grounds from './pages/Grounds';
import MyTeam from './pages/MyTeam';
import MatchDetails from './pages/MatchDetails';
import AdminPanel from './pages/Admin';
import JoinTeam from './pages/JoinTeam';
import AddHomeGround from './pages/AddHomeGround';
import './App.css';

// ===== AUTH GUARD COMPONENT =====
// Checks if user is authenticated, redirects to login if not
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

// ===== PUBLIC ONLY ROUTE =====
// Redirects authenticated users away from login/signup pages
function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ===== ROUTE TRANSITION WRAPPER =====
function AnimatedRoutes({ children }) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [direction, setDirection] = useState('forward');

  useEffect(() => {
    const prev = prevPathRef.current;
    const current = location.pathname;

    const prevDepth = prev.split('/').filter(Boolean).length;
    const currDepth = current.split('/').filter(Boolean).length;

    setDirection(currDepth >= prevDepth ? 'forward' : 'back');
    prevPathRef.current = current;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.key]);

  return (
    <div 
      className={`route-wrapper route-${direction}`} 
      key={location.key || location.pathname}
    >
      {children}
    </div>
  );
}

// ===== STADIUM LOADER COMPONENT =====
function StadiumLoader({ loading, progress }) {
  return (
    <div className={`stadium-loader ${!loading ? 'stadium-loaded' : ''}`}>
      <div className="floodlight floodlight-left">
        <div className="light-beam"></div>
        <div className="light-bulb"></div>
      </div>
      <div className="floodlight floodlight-right">
        <div className="light-beam"></div>
        <div className="light-bulb"></div>
      </div>

      <div className="pitch">
        <div className="pitch-strip"></div>
        <div className="pitch-crease crease-top"></div>
        <div className="pitch-crease crease-bottom"></div>
      </div>

      <div className="wickets wickets-top">
        <div className="stump"></div>
        <div className="stump"></div>
        <div className="stump"></div>
        <div className="bails"></div>
      </div>
      <div className="wickets wickets-bottom">
        <div className="stump"></div>
        <div className="stump"></div>
        <div className="stump"></div>
        <div className="bails"></div>
      </div>

      <div className="cricket-ball">
        <div className="ball-seam"></div>
      </div>

      <div className="scoreboard">
        <div className="scoreboard-text">CRICZONE</div>
        <div className="scoreboard-dots">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div className="stadium-progress">
        <div 
          className="stadium-progress-fill" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>

      <div className="boundary-rope">
        <div className="rope-section"></div>
        <div className="rope-section"></div>
        <div className="rope-section"></div>
        <div className="rope-section"></div>
      </div>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      progressRef.current += Math.random() * 12 + 3;
      const newProgress = Math.min(progressRef.current, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 250);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 400);
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <Router>
      <StadiumLoader loading={loading} progress={progress} />

      <div className={`app-content ${!loading ? 'app-visible' : ''}`}>
        <Routes>
          {/* PUBLIC ONLY ROUTES - redirect to home if already logged in */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/signup" element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          } />

          {/* PROTECTED ROUTES - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <Home />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <Matches />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="/matches/:id" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <MatchDetails />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="/grounds" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <Grounds />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="/my-team" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <MyTeam />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="/join-team" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <JoinTeam />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="/add-ground" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <AddHomeGround />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="main-container">
                  <div className="container">
                    <AnimatedRoutes>
                      <AdminPanel />
                    </AnimatedRoutes>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />

          {/* Fallback - redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;