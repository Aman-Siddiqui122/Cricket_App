import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Matches from './pages/Matches';
import Grounds from './pages/Grounds';
import MyTeam from './pages/MyTeam';
import MatchDetails from './pages/MatchDetails';
import AdminPanel from './pages/AdminPanel';
import JoinTeam from './pages/JoinTeam';
import AddHomeGround from './pages/AddHomeGround';

import './App.css';

// Protected Route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

// Public Only Route (Login/Signup)
function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className={`app-wrapper ${loading ? 'loading' : 'loaded'}`}>
        <Routes>
          {/* Public Routes */}
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

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Home />
              </>
            </ProtectedRoute>
          } />

          <Route path="/matches" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Matches />
              </>
            </ProtectedRoute>
          } />

          <Route path="/matches/:id" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MatchDetails />
              </>
            </ProtectedRoute>
          } />

          <Route path="/grounds" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Grounds />
              </>
            </ProtectedRoute>
          } />

          <Route path="/my-team" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MyTeam />
              </>
            </ProtectedRoute>
          } />

          <Route path="/join-team" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <JoinTeam />
              </>
            </ProtectedRoute>
          } />

          <Route path="/add-ground" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AddHomeGround />
              </>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AdminPanel />
              </>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;