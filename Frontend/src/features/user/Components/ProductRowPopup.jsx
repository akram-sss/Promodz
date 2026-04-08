import React, { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import FavoriteButton from '@shared/components/FavoriteButton/FavoriteButton';
import './ProductRowPopup.css';

const formatDa = (num) => {
  const n = Number(num);
  if (!Number.isFinite(n)) return '';
  const fixed = n.toFixed(2);
  const [i, d] = fixed.split('.');
  const intWithDots = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intWithDots},${d} DA`;
};

const formatTimeStatus = (startDate, endDate) => {
  const now = Date.now();
  const start = startDate ? Date.parse(startDate) : NaN;
  const end = endDate ? Date.parse(endDate) : NaN;

  if (Number.isFinite(start) && now < start) return null;
  if (!Number.isFinite(end)) return null;
  if (now >= end) return { label: 'Ended', tone: 'muted' };
  
  const diffMs = end - now;
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  
  return { label: `Ends in ${parts.join(' ')}`, tone: 'active' };
};

const ProductRowPopup = ({ 
  selectedProduct, 
  onFollowCompany, 
  isFollowing,
  followLoading,
  onClose,
  onLikeChange
}) => {
  const navigate = useNavigate();

  const images = useMemo(() => {
    const value = selectedProduct?.images ?? selectedProduct?.Images ?? [];
    return Array.isArray(value) && value.length > 0 ? value : ['/placeholder.png'];
  }, [selectedProduct]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(Boolean(selectedProduct?.isLiked));
  const [likesCount, setLikesCount] = useState(() => {
    const value = Number(selectedProduct?.Likes ?? selectedProduct?.likes ?? 0);
    return Number.isFinite(value) ? value : 0;
  });

  useEffect(() => {
    setSelectedImage(0);
    setIsLiked(Boolean(selectedProduct?.isLiked));
    const nextLikes = Number(selectedProduct?.Likes ?? selectedProduct?.likes ?? 0);
    setLikesCount(Number.isFinite(nextLikes) ? nextLikes : 0);
  }, [selectedProduct]);

  const resolved = useMemo(() => {
    const p = selectedProduct ?? {};
    const name = p.name ?? '';
    const brand = p.company ?? p.companyName ?? '';
    const discount = Number(p.discount ?? 0);
    const price = Number(p.price ?? 0);
    const finalPrice = price * (1 - discount / 100);
    const categories = Array.isArray(p.category) ? p.category : p.category ? [p.category] : [];
    const timeLeft = formatTimeStatus(p.startDate, p.endDate);
    const companyPagePath = p.company ? `/products/${encodeURIComponent(p.company)}` : (p.companyName ? `/products/${encodeURIComponent(p.companyName)}` : '');
    const link = p.Link ?? p.link ?? '';
    const description = p.description ?? 'No description available for this promotion.';
    
    return {
      name,
      brand,
      discount,
      price,
      finalPrice,
      categories,
      timeLeft,
      companyPagePath,
      link,
      description,
      startDate: p.startDate,
      endDate: p.endDate,
    };
  }, [selectedProduct]);

  const handleLikeChange = (newLikedState) => {
    const delta = newLikedState ? 1 : -1;
    const nextLikesCount = Math.max(0, likesCount + delta);
    
    setIsLiked(newLikedState);
    setLikesCount(nextLikesCount);
    onLikeChange?.(selectedProduct.id, newLikedState, nextLikesCount);
  };

  const handleFollowClick = () => {
    onFollowCompany?.(selectedProduct.companyID);
  };

  const formatDate = (date) => dayjs(date).format('MMM D, YYYY');

  return (
    <div className="user-popup-overlay" onClick={onClose}>
      <div className="user-popup" onClick={e => e.stopPropagation()}>
        <button className="user-popup-close-btn" onClick={onClose}>×</button>
        
        <div className="user-popup-content">
          {/* Image Gallery Section */}
          <div className="user-popup-image-gallery">
            <div className="user-main-image">
              <img src={images[selectedImage]} alt={resolved.name} />
            </div>
            {images.length > 1 && (
              <div className="user-thumbnail-images">
                {images.map((img, idx) => (
                  <div className="user-thumbnail-wrapper" key={idx}>
                    <img
                      src={img}
                      alt={resolved.name}
                      className={`user-thumbnail${selectedImage === idx ? ' active' : ''}`}
                      onClick={() => setSelectedImage(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="user-popup-product-details">
            <div className="user-product-header">
              <div className="user-title-row">
                <h2 className="user-product-title">{resolved.name}</h2>
                <div className="user-popup-like" title={isLiked ? 'Saved' : 'Save'}>
                  <FavoriteButton value={isLiked} onChange={handleLikeChange} />
                  <span className="user-popup-like-text">{isLiked ? 'Saved' : 'Save'}</span>
                </div>
              </div>
              <RouterLink 
                to={resolved.companyPagePath}
                className="user-product-brand"
                onClick={onClose}
              >
                {resolved.brand}
              </RouterLink>

              <div className="user-deal-row">
                {resolved.discount > 0 && (
                  <span className="user-deal-chip">-{Math.round(resolved.discount)}% OFF</span>
                )}
                {resolved.timeLeft && (
                  <span className={`user-timeleft-chip ${resolved.timeLeft.tone}`}>
                    {resolved.timeLeft.label}
                  </span>
                )}
                <span className="user-likes-chip">{likesCount} likes</span>
              </div>

              <div className="user-product-price">
                {resolved.discount > 0 ? (
                  <>
                    <span className="user-popup-price-final">{formatDa(resolved.finalPrice)}</span>
                    <span className="user-popup-price-original">{formatDa(resolved.price)}</span>
                  </>
                ) : (
                  <span className="user-popup-price-final">{formatDa(resolved.price)}</span>
                )}
              </div>
            </div>

            <div className="user-product-description">
              <h3>Description</h3>
              <p>{resolved.description}</p>
            </div>

            <div className="user-product-specs">
              <h3>Specifications</h3>
              <div className="user-specs-grid">
                <div className="user-spec-item user-spec-item-categories">
                  <span className="user-spec-label">Categories:</span>
                  <div className="user-spec-value user-categories-wrapper">
                    {resolved.categories.length > 0 ? (
                      resolved.categories.map((cat, idx) => (
                        <span key={idx} className="user-category-tag">{cat}</span>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
                <div className="user-spec-item">
                  <span className="user-spec-label">Brand:</span>
                  <span className="user-spec-value">{resolved.brand}</span>
                </div>
                <div className="user-spec-item">
                  <span className="user-spec-label">Discount:</span>
                  <span className="user-spec-value">{resolved.discount ? `${Math.round(resolved.discount)}%` : '-'}</span>
                </div>
                <div className="user-spec-item">
                  <span className="user-spec-label">Starts:</span>
                  <span className="user-spec-value">{resolved.startDate ? formatDate(resolved.startDate) : '-'}</span>
                </div>
                <div className="user-spec-item">
                  <span className="user-spec-label">Ends:</span>
                  <span className="user-spec-value">{resolved.endDate ? formatDate(resolved.endDate) : '-'}</span>
                </div>
              </div>
            </div>

            <div className="user-product-actions">
              {resolved.companyPagePath && (
                <button
                  className="user-action-btn primary"
                  onClick={() => {
                    onClose();
                    navigate(resolved.companyPagePath);
                  }}
                  title="Open company page"
                >
                  View Company Page
                </button>
              )}
              
              <button
                className={`user-action-btn ${isFollowing ? 'outlined' : 'secondary'}`}
                onClick={handleFollowClick}
                disabled={followLoading}
              >
                {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow Company'}
              </button>

              {resolved.link && (
                <a
                  className="user-action-btn secondary"
                  href={resolved.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                  title="Open promotion on company website"
                >
                  View on Company Site
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRowPopup;