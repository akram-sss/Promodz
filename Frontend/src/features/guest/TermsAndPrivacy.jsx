import React, { useState, useEffect } from 'react';
import './TermsAndPrivacy.css';
import { legalAPI } from '@shared/api';

export default function TermsAndPrivacy() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [legalSections, setLegalSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    legalAPI.getAll()
      .then(res => setLegalSections(res.data ?? []))
      .catch(() => setLegalSections([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <div className="terms-privacy-page">
      {/* Hero Section */}
      <div className="terms-hero">
        <div className="terms-hero-content">
          <div className="hero-badge">Legal Information</div>
          <h1 className="terms-hero-title">Terms & Privacy Policy</h1>
          <p className="terms-hero-subtitle">
            Understand the legal aspects of using PromoDz, including user rights and responsibilities, and our data privacy practices.
          </p>
        </div>
        <div className="hero-decoration"></div>
      </div>

      {loading ? (
        <div className="terms-loading">
          <div className="terms-loading-spinner"></div>
          <p>Loading legal content...</p>
        </div>
      ) : legalSections.length === 0 ? (
        <div className="terms-loading">
          <p>No legal content available yet.</p>
        </div>
      ) : (
      <>
      {/* Quick Navigation */}
      <div className="quick-nav">
        <h3 className="quick-nav-title">Quick Navigation</h3>
        <div className="quick-nav-grid">
          {legalSections.map((section, index) => (
            <a
              key={index}
              href={`#section-${index}`}
              className="quick-nav-item"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`section-${index}`).scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
              </svg>
              {section.title}
            </a>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="terms-content">
        {legalSections.map((section, index) => (
          <div
            key={index}
            id={`section-${index}`}
            className={`content-section ${expandedSection === index ? 'expanded' : ''}`}
          >
            <div className="section-header" onClick={() => toggleSection(index)}>
              <div className="section-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="section-title">{section.title}</h2>
              <button className="expand-toggle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`toggle-icon ${expandedSection === index ? 'rotated' : ''}`}>
                  <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="section-content">
              <p className="section-description">{section.description}</p>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Contact CTA */}
      <div className="terms-cta">
        <div className="cta-content">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="cta-icon">
            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
          </svg>
          <h3>Have Questions?</h3>
          <p>If you have any questions about our terms or privacy policy, feel free to reach out to our support team.</p>
          <a href="/contact" className="cta-button">
            <span>Contact Us</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="button-icon">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
