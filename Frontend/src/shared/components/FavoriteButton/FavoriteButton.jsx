import React, { useState } from 'react';
import './FavoriteButton.css';

export default function FavoriteButton({ value, onChange }) {
  const [internalValue, setInternalValue] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  const isControlled = value !== undefined;
  const isFavorite = isControlled ? Boolean(value) : internalValue;

  const setFavorite = (next) => {
    if (onChange) onChange(next);
    if (!isControlled) setInternalValue(next);
  };

  const toggleFavorite = () => {
    if (!isFavorite) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 700); // Sparkle duration
    }
    setFavorite(!isFavorite);
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite();
      }}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className={`favorite-btn${isFavorite ? ' is-active' : ''}`}
    >
      {isFavorite ? (
        // Filled heart
        <svg
          className={showSparkle ? 'heart-pop' : ''}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                   4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                   14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                   6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        // Outline heart
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 
                   0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 
                   0 0 0 0-7.8z" />
        </svg>
      )}
      {showSparkle && (
        <span className="sparkle-burst">
          <span className="sparkle s1"></span>
          <span className="sparkle s2"></span>
          <span className="sparkle s3"></span>
          <span className="sparkle s4"></span>
          <span className="sparkle s5"></span>
        </span>
      )}
    </button>
  );
}
