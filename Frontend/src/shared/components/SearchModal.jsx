import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchModal.css';
import { productAPI } from '@shared/api';
import { FileX } from 'lucide-react';

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const modalRef = useRef();
  const inputRef = useRef();
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); }
      catch { setRecentSearches([]); }
    }
  }, []);

  // Fetch trending searches from backend
  useEffect(() => {
    setLoadingTrending(true);
    productAPI.getTrendingSearches()
      .then(res => setTrendingSearches(res.data ?? []))
      .catch(() => setTrendingSearches([]))
      .finally(() => setLoadingTrending(false));
  }, []);

  // Debounced live suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(() => {
      productAPI.getSuggestions(query.trim())
        .then(res => setSuggestions(res.data ?? []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Save search to recent
  const saveSearchToRecent = useCallback((searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (searchTerm) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== searchTerm);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      saveSearchToRecent(query.trim());
      onClose();
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (searchTerm) => {
    saveSearchToRecent(searchTerm);
    onClose();
    navigate(`/search/${encodeURIComponent(searchTerm)}`);
  };

  const handleProductSuggestionClick = (product) => {
    saveSearchToRecent(product.name);
    onClose();
    navigate(`/search/${encodeURIComponent(product.name)}`);
  };

  const formatCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
  };

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        {/* Header with close + search */}
        <div className="search-modal-header" >
          <button className="close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon search-icon-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
                autoComplete="off"
              />
              {query.trim() && (
                <button
                  type="button"
                  className="search-clear-query"
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  aria-label="Clear"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <button type="submit" className="search-submit-btn" title="Search">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="search-modal-content">
          {query.trim().length < 2 ? (
            /* HOME STATE: Recent + Trending */
            <div className="search-home">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="search-section">
                  <div className="section-header">
                    <div className="section-title">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                      </svg>
                      <h3>Recent Searches</h3>
                    </div>
                    <button className="clear-btn" onClick={clearRecentSearches}>Clear all</button>
                  </div>
                  <div className="search-chips">
                    {recentSearches.map((search, index) => (
                      <div key={index} className="search-chip">
                        <button className="chip-text" onClick={() => handleSuggestionClick(search)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="chip-icon">
                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                          </svg>
                          {search}
                        </button>
                        <button className="chip-remove" onClick={() => removeRecentSearch(search)} aria-label="Remove">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="search-section">
                <div className="section-header">
                  <div className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="section-icon trending">
                      <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 01.968-.432l5.942 2.28a.75.75 0 01.431.97l-2.28 5.941a.75.75 0 11-1.4-.537l1.63-4.251-1.086.483a11.2 11.2 0 00-5.45 5.174.75.75 0 01-1.199.19L9 12.31l-6.22 6.22a.75.75 0 11-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l3.606 3.605a12.694 12.694 0 015.68-4.973l1.086-.484-4.251-1.631a.75.75 0 01-.432-.97z" clipRule="evenodd" />
                    </svg>
                    <h3>Trending Searches</h3>
                  </div>
                  <span className="trending-badge">🔥 Hot</span>
                </div>
                {loadingTrending ? (
                  <div className="trending-loading">
                    <div className="trending-skeleton"></div>
                    <div className="trending-skeleton"></div>
                    <div className="trending-skeleton"></div>
                  </div>
                ) : trendingSearches.length > 0 ? (
                  <div className="trending-list">
                    {trendingSearches.map((item) => (
                      <button
                        key={item.id}
                        className="trending-item"
                        onClick={() => handleSuggestionClick(item.text)}
                      >
                        <div className={`trending-number ${item.id <= 3 ? 'top-three' : ''}`}>#{item.id}</div>
                        <div className="trending-content">
                          <div className="trending-text">{item.text}</div>
                          <div className="trending-count">{formatCount(item.count)} searches</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="trending-arrow">
                          <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="trending-empty">
                    <p>No trending searches yet — be the first to explore!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* SUGGESTIONS STATE: Live product results */
            <div className="search-suggestions">
              {loadingSuggestions ? (
                <div className="suggestions-loading">
                  <div className="suggestion-skeleton"></div>
                  <div className="suggestion-skeleton"></div>
                  <div className="suggestion-skeleton"></div>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="suggestions-header">
                    <span className="suggestions-count">{suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}</span>
                    <button className="view-all-btn" onClick={handleSearchSubmit}>
                      View all results
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="suggestions-list">
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        className="suggestion-item"
                        onClick={() => handleProductSuggestionClick(product)}
                      >
                        <div className="suggestion-image">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <div className="suggestion-image-placeholder">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-name">{product.name}</span>
                          <span className="suggestion-meta">
                            {product.company && <span className="suggestion-company">{product.company}</span>}
                            {product.category && <span className="suggestion-category">{product.category}</span>}
                          </span>
                        </div>
                        <div className="suggestion-price-area">
                          {product.discount > 0 && (
                            <span className="suggestion-discount">-{product.discount}%</span>
                          )}
                          <span className="suggestion-price">{product.price.toLocaleString('fr-DZ')} DA</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="search-all-results-btn" onClick={handleSearchSubmit}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Search all for &ldquo;{query}&rdquo;
                  </button>
                </>
              ) : (
                <div className="no-suggestions">
                  <div className="no-suggestions-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                      <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="no-suggestions-title">No products found for &ldquo;{query}&rdquo;</p>
                  <p className="no-suggestions-hint">Try a different keyword or check the spelling</p>
                  <button className="search-all-results-btn" onClick={handleSearchSubmit}>
                    Search all results for &ldquo;{query}&rdquo;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="search-modal-footer">
          <span>Search powered by <strong>PromoDz</strong></span>
        </div>
      </div>
    </div>
  );
}
