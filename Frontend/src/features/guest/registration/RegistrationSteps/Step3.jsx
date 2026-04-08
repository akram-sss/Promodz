import React, { useState } from 'react';
import './Step3.css';
import { useNavigate } from 'react-router-dom';

const INTERESTS = [
  { label: 'Electronics', icon: '💻' },
  { label: 'Health & Care', icon: '🏥' },
  { label: 'Home & Garden', icon: '🏡' },
  { label: 'Food & Dining', icon: '🍽️' },
  { label: 'Travel', icon: '✈️' },
  { label: 'Clothing', icon: '👕' },
  { label: 'Sports', icon: '⚽' },
  { label: 'Entertainment', icon: '🎬' },
  { label: 'Books', icon: '📚' },
];

export default function Step3({ onBack, formData }) {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const toggleInterest = (label) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : prev.length < 3
        ? [...prev, label]
        : prev
    );
  };

  const handleFinish = () => {
    // Account is already created and verified — redirect to login
    navigate('/connection');
  };

  return (
    <div className="step3-form">
      <div className="step3-header">
        <div className="icon-container" style={{ background: '#f0fdf4', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#22C55E"/>
            <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 style={{ color: '#22C55E' }}>Email Verified!</h3>
        <p className="step3-label" style={{ marginBottom: '16px' }}>Your account has been created successfully. Choose up to <b>3 interests</b> ({selected.length}/3)</p>
      </div>

      <div className="step3-interests-grid">
        {INTERESTS.map((interest) => (
          <button
            type="button"
            key={interest.label}
            className={`step3-interest-btn${selected.includes(interest.label) ? ' selected' : ''}${selected.length >= 3 && !selected.includes(interest.label) ? ' disabled' : ''}`}
            onClick={() => toggleInterest(interest.label)}
            disabled={selected.length >= 3 && !selected.includes(interest.label)}
          >
            <span className="interest-icon">{interest.icon}</span>
            <span className="interest-label">{interest.label}</span>
            {selected.includes(interest.label) && (
              <div className="checkmark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="step3-buttons">
        <button type="button" className="step3-back-btn" onClick={onBack}>
          Back
        </button>
        <button type="button" className="step3-finish-btn" onClick={handleFinish}>
          Go to Login
        </button>
      </div>

      <button type="button" className="step3-later-btn" onClick={handleFinish}>
        Skip for now
      </button>
    </div>
  );
}
