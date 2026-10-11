import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register Page Component
 * Handles new user registration with client validation and public role enforcement.
 */
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please provide your full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please provide your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authUser = await register(trimmedName, trimmedEmail, password);

      // Public registration strictly assigns role 'user' -> redirects to /courses
      if (authUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/courses');
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container auth-page-container">
      <div className="auth-card">
        <div className="auth-header auth-card-header">
          <div className="auth-icon" aria-hidden="true">📝</div>
          <h2>Create Your Account</h2>
          <p className="auth-subtitle">
            Sign up to browse our full course catalog and view course details.
          </p>
        </div>

        {error && (
          <div className="auth-error alert alert-danger" role="alert" id="register-error-alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              type="text"
              id="register-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              required
              autoComplete="name"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              type="email"
              id="register-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              required
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password (minimum 6 characters)</label>
            <input
              type="password"
              id="register-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          <div className="role-security-notice">
            <small>
              🔒 <strong>Security Policy:</strong> Public registrations are automatically assigned
              standard <code>user</code> permissions. Admin privileges are restricted to internal configuration.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            id="register-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer auth-card-footer">
          <p>
            Already registered?{' '}
            <Link to="/login" className="auth-link">
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
