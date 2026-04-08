import React, { useState, useRef, useEffect } from 'react';
import './Step2.css';
import { userAPI } from '@shared/api';

export default function Step2({ onNext, onBack, formData }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    otpInputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (error) setError('');

    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedCode.forEach((digit, i) => {
        if (index + i < 6 && /^\d$/.test(digit)) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextEmptyIndex = newOtp.findIndex((d) => !d);
      otpInputRefs.current[nextEmptyIndex === -1 ? 5 : nextEmptyIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await userAPI.verifyEmail(formData.email, code);
      setSuccess('Email verified successfully!');
      setTimeout(() => onNext(), 1500);
    } catch (err) {
      const message = err.response?.data?.error || 'Verification failed. Please try again.';
      setError(message);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    setError('');
    setSuccess('');

    try {
      await userAPI.resendVerification(formData.email);
      setSuccess('A new code has been sent to your email.');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form className="step2-form" onSubmit={handleVerify}>
      <div className="step2-header">
        <div className="icon-container">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#7C3AED"/>
          </svg>
        </div>
        <h3>Verify Your Email</h3>
        <p className="step2-label">We've sent a 6-digit verification code to <strong>{formData.email}</strong></p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '24px 0' }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (otpInputRefs.current[index] = el)}
            type="text"
            maxLength="6"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            inputMode="numeric"
            autoComplete="one-time-code"
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 'bold',
              border: digit ? '2px solid #7C3AED' : '2px solid #e0e0e0',
              borderRadius: '12px',
              outline: 'none',
              transition: 'border-color 0.2s',
              background: digit ? '#f3f0ff' : '#fff',
              color: '#1a1a1a',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7C3AED';
              e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = digit ? '#7C3AED' : '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>

      {error && <div style={{ color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>{error}</div>}
      {success && <div style={{ color: '#16a34a', background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>{success}</div>}

      <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px', color: '#666' }}>
        <span>Didn't receive the code? </span>
        {canResend ? (
          <button type="button" onClick={handleResend} style={{ color: '#7C3AED', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Resend
          </button>
        ) : (
          <span style={{ color: '#7C3AED', fontWeight: 600 }}>Resend in {formatTime(resendTimer)}</span>
        )}
      </div>

      <div className="step2-buttons">
        <button type="button" className="step2-back-btn" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="step2-signup-btn" disabled={loading || otp.join('').length !== 6}>
          {loading ? <span className="loading-spinner"></span> : 'Verify Email'}
        </button>
      </div>
    </form>
  );
}
