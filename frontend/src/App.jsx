import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CoursesPage from './pages/CoursesPage';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import './auth.css';
import './App.css';

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

            {/* Course catalog route (Divyansh) */}
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

            {/* Protected Admin Route with AdminDashboard (Naman) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
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
