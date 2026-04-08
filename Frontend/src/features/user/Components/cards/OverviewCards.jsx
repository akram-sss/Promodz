import React from 'react';
import './OverviewCards.css';
const OverviewCards = ({cards}) => (
  <div className="cards-container">
    {cards.map((card, i) => (
      <div key={i} className="card">
        <h3 className="card-title">{card.title}</h3>
        <p className="card-value">{card.value}</p>
        <span className="card-change">{card.change}</span>
      </div>
    ))}
  </div>
);

export default OverviewCards;