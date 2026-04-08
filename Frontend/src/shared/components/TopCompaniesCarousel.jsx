import React from 'react';
import './TopCompaniesCarousel.css';
import DealsCard from './DealsCard';

export default function TopCompaniesCarousel({ companies }) {
  // Duplicate the companies array to create seamless infinite scroll
  const duplicatedCompanies = [...companies, ...companies, ...companies];

  if (!companies || companies.length === 0) {
    return null;
  }

  // Calculate animation values
  const itemCount = companies.length;
  const cardWidth = 450; // Width of each DealsCard
  const gap = 24; // Gap between cards
  const totalWidth = (cardWidth + gap) * itemCount;
  const animationDuration = totalWidth / 30; // 30px per second

  return (
    <div className="top-companies-section">
      <div className="top-companies-header">
        <h2>Featured Partner Deals</h2>
        <p>Exclusive offers from our top partners - Don't miss out!</p>
      </div>
      <div className="top-companies-carousel">
        <div 
          className="carousel-track"
          style={{
            '--total-width': `${totalWidth}px`,
            '--animation-duration': `${animationDuration}s`
          }}
        >
          {duplicatedCompanies.map((company, index) => (
            <DealsCard
              key={`${company.id}-${index}`}
              offre={company.text}
              logo={company.logo}
              image={company.image}
              companyName={company.name}
              companyLink={company.CompanyLink}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
