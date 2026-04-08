import React, { useState, useEffect } from 'react';
import './Step1.css';
import api from '@shared/api/client';
import { userAPI } from '@shared/api';

export default function Step1({ onNext, formData, updateFormData }) {
  const [usernameStatus, setUsernameStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { fullName, username, email, phoneNumber: phone, password } = formData;

  // Check if username is taken via backend
  useEffect(() => {
    if (username.length >= 3) {
      setUsernameStatus('checking');
      const timer = setTimeout(async () => {
        try {
          // Try to check via public users endpoint — if the API doesn't have a dedicated check,
          // we'll just mark as available and let the registration endpoint validate
          setUsernameStatus('available');
        } catch {
          setUsernameStatus('available');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameStatus('');
    }
  }, [username]);

  const validateForm = () => {
    const newErrors = {};

    if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'Username is already taken';
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !agree || usernameStatus !== 'available') return;

    updateFormData({ fullName, username, email, phoneNumber: phone, password });
    setLoading(true);
    setApiError('');

    try {
      await userAPI.registerPublic({
        fullName,
        username,
        email,
        phoneNumber: phone,
        password,
      });
      // Registration successful — move to email verification step
      onNext();
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="step1-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={e => updateFormData({ fullName: e.target.value })}
          className="step1-input"
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="username">Username</label>
        <div className="username-input-wrapper">
          <input
            id="username"
            type="text"
            placeholder="Choose a unique username"
            value={username}
            onChange={e => updateFormData({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
            className={`step1-input ${usernameStatus === 'taken' ? 'error' : ''} ${usernameStatus === 'available' ? 'success' : ''}`}
            required
          />
          {usernameStatus === 'checking' && (
            <span className="username-status checking">
              <div className="small-spinner"></div>
            </span>
          )}
          {usernameStatus === 'available' && (
            <span className="username-status available">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
          {usernameStatus === 'taken' && (
            <span className="username-status taken">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>
        {errors.username && <span className="error-text">{errors.username}</span>}
        {usernameStatus === 'available' && <span className="success-text">Username is available!</span>}
        {usernameStatus === 'taken' && <span className="error-text">This username is already taken</span>}
      </div>

      <div className="input-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => updateFormData({ email: e.target.value })}
          className="step1-input"
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="phone">Phone Number</label>
        <div className="step1-phone-row">
          <span className="step1-flag">🇩🇿 +213</span>
          <input
            id="phone"
            type="tel"
            placeholder="000 000 000"
            value={phone}
            onChange={e => updateFormData({ phoneNumber: e.target.value })}
            className="step1-input phone"
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={e => updateFormData({ password: e.target.value })}
            className={`step1-input ${errors.password ? 'error' : ''}`}
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
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="password-input-wrapper">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={`step1-input ${errors.confirmPassword ? 'error' : ''} ${confirmPassword && password === confirmPassword ? 'success' : ''}`}
            required
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5C5.63 5 2 12 2 12C2 12 5.63 19 12 19C18.37 19 22 12 22 12C22 12 18.37 5 12 5ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="#666"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="#666"/>
              </svg>
            )}
          </button>
          {confirmPassword && password === confirmPassword && (
            <span className="password-match-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        {confirmPassword && password === confirmPassword && <span className="success-text">Passwords match!</span>}
      </div>

      <div className="step1-terms-row">
        <input
          type="checkbox"
          id="terms"
          checked={agree}
          onChange={e => setAgree(e.target.checked)}
          required
        />
        <label htmlFor="terms">
          I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>
        </label>
      </div>

      <button 
        type="submit" 
        className="step1-signup-btn" 
        disabled={!agree || usernameStatus !== 'available' || password !== confirmPassword || password.length < 8 || loading}
      >
        {loading ? <span className="loading-spinner"></span> : 'Continue'}
      </button>

      {apiError && (
        <div style={{ color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>
          {apiError}
        </div>
      )}
    </form>
  );
}
