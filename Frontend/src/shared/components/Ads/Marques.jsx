import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Marques.css';
import { topCompanyAPI } from '@shared/api';
import defaultLogo from '@assets/PromoDzLogo.svg';

export default function Marques() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    topCompanyAPI.getAll()
      .then(res => {
        const data = res.data ?? [];
        setCompanies(data.map(tc => ({
          id: tc.id,
          name: tc.company?.companyName || tc.company?.fullName || tc.name,
          logo: tc.company?.image || tc.logo || defaultLogo,
          url: tc.CompanyLink,
          // username is what the /products/:company route matches against
          companySlug: tc.company?.username || tc.company?.fullName || tc.name,
        })));
      })
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCompanyClick = (e, companyName) => {
    e.preventDefault();
    if (companyName) {
      navigate(`/products/${encodeURIComponent(companyName)}`);
    }
  };

  if (loading) {
    return (
      <div className="marquee-section">
        <div className="marquee-header">
          <h2>Our Trusted Partners</h2>
          <p>Discover amazing deals from these top brands</p>
        </div>
        <div className="marquee-loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="marquee-skeleton">
              <div className="skeleton-circle"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return null;
  }

  // Calculate animation duration based on number of companies
  const itemWidth = 120;
  const gap = 60;
  const totalWidth = (itemWidth + gap) * companies.length;
  const animationDuration = totalWidth / 30; // 30px per second

  return (
    <div className="marquee-section">
      <div className="marquee-header">
        <h2>Our Trusted Partners</h2>
        <p>Discover amazing deals from these top brands</p>
      </div>
      
      <div className="marquee-container">
        <div 
          className="marquee-track"
          style={{
            animationDuration: `${animationDuration}s`,
            '--total-width': `${totalWidth}px`
          }}
        >
          {[...companies, ...companies, ...companies].map((company, index) => (
            <div
              key={`${company.id}-${index}`}
              onClick={(e) => handleCompanyClick(e, company.companySlug || company.name)}
              className="marquee-item"
              title={`View all ${company.name} products`}
            >
              <div className="marquee-item-inner">
                <div className="logo-circle">
                      <img src={company.logo} alt={company.name} />
                </div>
                <span className="company-name">{company.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
