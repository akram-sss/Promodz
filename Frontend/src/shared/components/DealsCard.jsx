import React from 'react'
import "./DealsCard.css"

export default function DealsCard({ offre, logo, image, companyName, companyLink }) {
  const handleSeeDeals = () => {
    if (companyLink) {
      window.open(companyLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className='DealCard'>
      <div className='DealCard-left'>
        <div className='Deal-Logo'>
          {logo && <img src={logo} alt={companyName || "company logo"} />}
        </div>
        
        <p>{offre}</p>
        <button onClick={handleSeeDeals}>
          {companyLink ? 'Visit Store' : 'see deals'}
        </button>
      </div>
      <div className='DealCard-right'>
        {image ? (
          <img
            src={image}
            alt={companyName || "deal"}
            className='DealCard-image'
          />
        ) : (
          <span>picture</span>
        )}
      </div>
    </div>
  )
}
