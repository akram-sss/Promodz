import React, { useState } from 'react';
import './Connection.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

export default function Connection() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role } = useAuth();

  // If already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (isAuthenticated && role) {
      const roleRedirects = {
        SUPER_ADMIN: '/admin',
        ADMIN: '/admin',
        ENTREPRISE: '/company',
        USER: '/user',
      };
      const from = location.state?.from?.pathname || roleRedirects[role] || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(identifier, password);
      
      // Redirect based on role
      const roleRedirects = {
        SUPER_ADMIN: '/admin',
        ADMIN: '/admin',
        ENTREPRISE: '/company',
        USER: '/user',
      };
      const from = location.state?.from?.pathname || roleRedirects[user.role] || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification && data?.email) {
        // User needs to verify email — redirect to registration verification
        setError('Please verify your email before logging in. Check your inbox for the verification code.');
      } else {
        const message = data?.message || data?.error || 'Login failed. Please check your credentials.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connection-container">
      <div className="connection-left">
        <div className="connection-image">
          <div className="overlay-content">
            <h2>Welcome Back!</h2>
            <div>Sign in to continue your journey with us</div>
          </div>
        </div>
      </div>
      <div className="connection-right">
        <form className="connection-form" onSubmit={handleSignIn}>
          <div className="form-header">
            <h1>Sign In</h1>
            <p className="subtitle">Welcome back! Please enter your details.</p>
          </div>

          <div className="input-group">
            <label htmlFor="identifier">Email or Username</label>
            <input
              id="identifier"
              type="text"
              placeholder="Enter your email or username"
              className="connection-input"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="connection-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5C5.63 5 2 12 2 12C2 12 5.63 19 12 19C18.37 19 22 12 22 12C22 12 18.37 5 12 5ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="#666"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="#666"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>

          {error && <div className="error-message" style={{ color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' }}>{error}</div>}

          <button
            type="submit"
            className="sign-in-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="signup-link"
              onClick={() => navigate('/registration')}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
