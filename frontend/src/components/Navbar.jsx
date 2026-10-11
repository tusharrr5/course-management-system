import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../navbar.css';

/**
 * Navbar Component
 * Dynamically displays navigation links, role badges, and auth actions
 * based on the user's authentication status and role.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <nav className="navbar" aria-label="Main Navigation">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-title">Course Management System</span>
          </Link>

          <div className="navbar-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              Courses
            </NavLink>

            {isAuthenticated && user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-link nav-link-admin ${isActive ? 'nav-link-active' : ''}`
                }
              >
                Admin Dashboard
              </NavLink>
            )}
          </div>
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="navbar-user-section">
              <span className="user-greeting">
                Hello, <strong>{user?.name || user?.email}</strong>
              </span>
              <span className={`badge badge-${user?.role || 'user'}`}>
                {user?.role || 'user'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm logout-btn"
                id="logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
