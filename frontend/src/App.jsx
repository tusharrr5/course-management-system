import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CoursesPage from './pages/CoursesPage';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import './auth.css';
import './App.css';

/**
 * Temporary Route Placeholder: Admin Dashboard Page
 * Preserves the route contract for Naman, whose PR #10 contains the full Admin Dashboard & Course Forms.
 * Protected by AdminRoute to verify Role-Based Access Control.
 */
function AdminDashboardPlaceholder() {
  const { user } = useAuth();

  return (
    <div className="placeholder-container">
      <div className="placeholder-card">
        <h2>⚙️ Admin Dashboard</h2>
        <p className="placeholder-note">
          Notice: Naman's PR #10 contains the full Admin Dashboard & Course Forms.
        </p>
        <p>
          🎉 <strong>Role-Based Access Control Verified!</strong> You are authenticated as an{' '}
          <span className="badge badge-admin">{user?.role}</span> ({user?.name || user?.email}).
        </p>
        <p style={{ marginTop: '16px' }}>
          Normal users cannot access this area (HTTP 403 Forbidden).
        </p>
        <div className="action-buttons">
          <Link to="/courses" className="btn btn-outline">
            &larr; Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Application Component
 * Single BrowserRouter wrapping the AuthProvider, Navbar, and application Routes.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Default redirect to /courses */}
            <Route path="/" element={<Navigate to="/courses" replace />} />

            {/* Public authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Course catalog route */}
            <Route path="/courses" element={<CoursesPage />} />

            {/* Protected Student Route using ProtectedRoute */}
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <div className="placeholder-container">
                    <div className="placeholder-card">
                      <h2>🎓 My Enrolled Courses</h2>
                      <p>Authenticated student portal. Welcome to your learning space!</p>
                      <div className="action-buttons">
                        <Link to="/courses" className="btn btn-outline">
                          Browse Courses
                        </Link>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Route (Naman's PR #10 placeholder) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPlaceholder />
                </AdminRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/courses" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
