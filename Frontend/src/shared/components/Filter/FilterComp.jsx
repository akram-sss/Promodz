import React, { useState } from 'react'
import './FilterComp.css'
import { useNavigate } from 'react-router-dom'

import Filter from './Filter'
import AdBanner from '@components/Ads/AdBanner'
import logo from '@assets/PromoDzLogo.svg'
import { useCategories } from '@shared/hooks/useProducts'

import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';

const getCatIcon = (name) => {
  const n = String(name || '').toLowerCase();
  if (n.includes('fashion') || n.includes('apparel')) return <CheckroomOutlinedIcon />;
  if (n.includes('electronics') || n.includes('gadgets')) return <DevicesOtherOutlinedIcon />;
  if (n.includes('home') || n.includes('living')) return <ChairOutlinedIcon />;
  if (n.includes('grocer') || n.includes('food')) return <LocalGroceryStoreOutlinedIcon />;
  if (n.includes('beauty') || n.includes('personal care')) return <SpaOutlinedIcon />;
  if (n.includes('health') || n.includes('fitness')) return <FitnessCenterOutlinedIcon />;
  if (n.includes('toys') || n.includes('hobbies') || n.includes('entertainment')) return <SportsEsportsOutlinedIcon />;
  if (n.includes('automotive') || n.includes('tools')) return <BuildOutlinedIcon />;
  if (n.includes('travel') || n.includes('tourism')) return <FlightTakeoffOutlinedIcon />;
  return <CheckroomOutlinedIcon />;
};

export default function FilterComp({ value, onChange }) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [activeChip, setActiveChip] = useState(null);

  const handleChipClick = (catName) => {
    if (activeChip === catName) {
      setActiveChip(null);
      navigate('/explore');
    } else {
      setActiveChip(catName);
      navigate(`/categories/${encodeURIComponent(catName)}`);
    }
  };

  return (
    <div className='FilterAndBest'>
        {/* Mobile horizontal category strip */}
        <div className='FAB-filter-mobile'>
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`FAB-filter-mobile__chip ${activeChip === cat.name ? 'FAB-filter-mobile__chip--active' : ''}`}
              onClick={() => handleChipClick(cat.name)}
            >
              {getCatIcon(cat.name)}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Desktop sidebar filter */}
        <div className='FAB-filter'>
            <Filter value={value} onChange={onChange} />
        </div>
        <div className='FAB-discounts'>
            <div className="fab-background-animation">
                <div className="fab-circle fab-circle-1"></div>
                <div className="fab-circle fab-circle-2"></div>
                <div className="fab-circle fab-circle-3"></div>
            </div>
            
            <div className="fab-header">
                <div className="fab-logo-wrapper">
                    <img
                        src={logo}
                        alt="PromoDZ Logo"
                        className="fab-logo"
                    />
                </div>
                <div className="fab-logo-text">
                    <div className="fab-logo-main-wrapper">
                        <span className="fab-logo-main">PROMO</span>
                        <span className="fab-logo-dz">DZ</span>
                    </div>
                    <div className="fab-logo-desc">DAILY DEALS SITE</div>
                </div>
            </div>
            
            <div className="fab-content">
                <div className="fab-titles">
                    <div className="fab-title-group">
                        <h1 className="fab-best">BEST</h1>
                        <h1 className="fab-discounts-title">DISCOUNTS</h1>
                    </div>
                    <h2 className="fab-subtitle">
                        <span className="fab-subtitle-icon">🏠</span>
                        YOU STAY AT HOME WE FIND DEALS!
                    </h2>
                    <button className="fab-order-btn">
                        <span>Order now!</span>
                        <span className="btn-arrow">→</span>
                    </button>
                    <div className="fab-footer">
                        <div className="fab-footer-item">
                            <span className="fab-footer-icon">📞</span>
                            <div>
                                <span className="fab-footer-title">Call Centre</span>
                                <span className="fab-footer-info">+213 6 761 403 05</span>
                            </div>
                        </div>
                        <div className="fab-footer-item">
                            <span className="fab-footer-icon">🌐</span>
                            <div>
                                <span className="fab-footer-title">Visit Website</span>
                                <span className="fab-footer-info">www.promo-dz.com</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fab-image">
                    <div className="fab-image-glow"></div>
                    <img
                        src={logo}
                        alt="Discount Megaphone"
                    />
                </div>
            </div>
        </div>
        <div className='FAB-right'>
            <div className='FAB-promo'>
                <AdBanner adId={5} variant="tall" />
            </div>
            <div className='FAB-calls'>
                <AdBanner adId={6} variant="tall" />
            </div>
        </div>
    </div>
  )
}
