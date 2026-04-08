import React, { useMemo, useState, useCallback, useEffect } from 'react'
import './ProductCard.css'
import FavoriteButton from './FavoriteButton/FavoriteButton'

import ProdutImg2 from "@assets/iPhone.svg"
import ProdutImg3 from "@assets/Product.png"
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useUserInteractions } from '@context/UserInteractionsContext';
import { productAPI, companyAPI, userAPI } from '@shared/api';

const formatDa = (num) => {
  const n = Number(num);
  if (!Number.isFinite(n)) return '';
  const fixed = n.toFixed(2);
  const [i, d] = fixed.split('.');
  const intWithDots = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intWithDots},${d} DA`;
};

const parseDa = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value == null) return null;
  const raw = String(value);
  const cleaned = raw.replace(/[^0-9,.-]/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
};

const formatTimeDiff = (diffMs) => {
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
};

const formatTimeStatus = (startDate, endDate) => {
  const now = Date.now();
  const start = startDate ? Date.parse(startDate) : NaN;
  const end = endDate ? Date.parse(endDate) : NaN;

  // Coming soon: do not show the chip
  if (Number.isFinite(start) && now < start) return null;
  if (!Number.isFinite(end)) return null;
  if (now >= end) return { label: 'Ended', tone: 'muted' };
  return { label: `Ends in ${formatTimeDiff(end - now)}`, tone: 'active' };
};

const isWithinLastDays = (dateValue, days) => {
  const ts = dateValue ? Date.parse(dateValue) : NaN;
  if (!Number.isFinite(ts)) return false;
  const now = Date.now();
  const windowMs = Math.max(0, Number(days)) * 24 * 60 * 60 * 1000;
  return now - ts >= 0 && now - ts <= windowMs;
};

const isLastMinuteCheck = (endDate) => {
  const end = endDate ? Date.parse(endDate) : NaN;
  if (!Number.isFinite(end)) return false;
  const now = Date.now();
  const remaining = end - now;
  return remaining > 0 && remaining <= 24 * 60 * 60 * 1000;
};

export default function ProductCrad({ product, ProdutImg, ProductName, mark, ProductPrice }) {

  const [showPopup, setShowPopup] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, isFollowingCompany, setFavorite, setFollowing } = useUserInteractions();

  const handleCardClick = () => {
    // Track product click (works for guests + authenticated users)
    const pid = product?.id;
    if (pid) productAPI.click(pid).catch(() => {});

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
    } else {
      setShowPopup(true);
    }
  };

  const resolved = useMemo(() => {
    const p = product && typeof product === 'object' ? product : {};
    const name = p?.name ?? ProductName ?? '';
    const brand = p?.companyName ?? p?.company ?? p?.mark ?? mark ?? '';

    const discountRaw = p?.discount ?? p?.Discount ?? 0;
    const discountNumber = Number(discountRaw);
    const discount = Number.isFinite(discountNumber) ? Math.min(100, Math.max(0, discountNumber)) : 0;

    const startDate = p?.startDate ?? null;
    const endDate = p?.endDate ?? null;
    const createdAt = p?.createdAt ?? p?.createdDate ?? p?.created_on ?? p?.createdOn ?? startDate ?? null;
    const isNew = isWithinLastDays(createdAt, 2);
    const isLastMinute = isLastMinuteCheck(endDate);
    const timeLeft = formatTimeStatus(startDate, endDate);

    const categories = Array.isArray(p?.categories) ? p.categories : Array.isArray(p?.category) ? p.category : [];
    const primaryCategory = categories?.[0] ?? '';

    const priceNumber =
      typeof p?.price === 'number'
        ? p.price
        : typeof p?.priceNumber === 'number'
          ? p.priceNumber
          : parseDa(p?.price ?? ProductPrice);
    const originalPriceLabel = ProductPrice ?? (priceNumber != null ? formatDa(priceNumber) : '');
    const finalPriceNumber = priceNumber != null ? priceNumber * (1 - discount / 100) : null;
    const finalPriceLabel = finalPriceNumber != null ? formatDa(finalPriceNumber) : originalPriceLabel;

    const imagesRaw = p?.images ?? p?.Images ?? p?.image ?? p?.Image ?? ProdutImg;
    const images = Array.isArray(imagesRaw) ? imagesRaw.filter(Boolean) : imagesRaw ? [imagesRaw] : [];
    if (images.length === 0) images.push(ProdutImg2);

    const description = p?.description ?? '';
    const link = p?.link ?? p?.Link ?? '';
    const companyPagePath = brand ? `/products/${encodeURIComponent(String(brand))}` : '';
    const likes = Number.isFinite(Number(p?.likes ?? p?.Likes)) ? Number(p?.likes ?? p?.Likes) : null;
    const isTrendy = typeof likes === 'number' && likes >= 10;
    const isLikedInitial = Boolean(p?.isLiked ?? p?.IsLiked ?? false);

    return {
      name,
      brand,
      discount,
      timeLeft,
      isNew,
      isLastMinute,
      isTrendy,
      startDate,
      endDate,
      description,
      primaryCategory,
      categories,
      priceNumber,
      originalPriceLabel,
      finalPriceLabel,
      finalPriceNumber,
      images,
      link,
      companyPagePath,
      likes,
      isLikedInitial,
    };
  }, [product, ProductName, mark, ProductPrice, ProdutImg]);

  // Derive initial states from the UserInteractions context (persisted)
  const pid = product?.id;
  const cid = product?.companyId || product?.companyID;
  const contextLiked = pid ? isFavorite(pid) : false;
  const contextFollowing = cid ? isFollowingCompany(cid) : false;

  // Compute adjusted likes: if context says user liked but backend count doesn't
  // include it (stale fetch), ensure the count reflects the user's like
  const adjustedLikes = useMemo(() => {
    const base = resolved.likes ?? 0;
    if (typeof base !== 'number') return base;
    // If the user has liked this product and the backend returned 0, show at least 1
    if (contextLiked) return Math.max(base, 1);
    return base;
  }, [resolved.likes, contextLiked]);

  const [isLiked, setIsLiked] = useState(contextLiked);
  const [likesCount, setLikesCount] = useState(adjustedLikes);
  const [isFollowing, setIsFollowing] = useState(contextFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Sync when context loads (e.g. after the initial fetch completes)
  useEffect(() => { setIsLiked(contextLiked); }, [contextLiked]);
  useEffect(() => { setIsFollowing(contextFollowing); }, [contextFollowing]);
  // Keep likesCount in sync with adjusted value (context + backend)
  useEffect(() => { setLikesCount(adjustedLikes); }, [adjustedLikes]);

  const handleLikeChange = useCallback(async (newLikedState) => {
    if (!isAuthenticated) return;
    const pid = product?.id;
    if (!pid || likeLoading) return;

    // Optimistic update
    setIsLiked(newLikedState);
    if (typeof likesCount === 'number') {
      setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
    }

    setLikeLoading(true);
    try {
      await userAPI.toggleFavorite(pid);
      // Sync context so all cards showing this product update
      setFavorite(pid, newLikedState);
    } catch (err) {
      // Revert on failure
      console.error('Failed to toggle favorite:', err);
      setIsLiked(!newLikedState);
      if (typeof likesCount === 'number') {
        setLikesCount(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1);
      }
    } finally {
      setLikeLoading(false);
    }
  }, [isAuthenticated, product?.id, likeLoading, likesCount, setFavorite]);

  const handleFollowClick = useCallback(async () => {
    if (!isAuthenticated) return;
    const cid = product?.companyId || product?.companyID;
    if (!cid || followLoading) return;

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowLoading(true);

    try {
      if (wasFollowing) {
        await userAPI.unfollowCompany(cid);
      } else {
        await userAPI.followCompany(cid);
      }
      // Sync context so all cards from this company update
      setFollowing(cid, !wasFollowing);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setIsFollowing(wasFollowing); // revert
    } finally {
      setFollowLoading(false);
    }
  }, [isAuthenticated, product?.companyId, product?.companyID, isFollowing, followLoading, setFollowing]);

  // Gallery fallback
  const images = useMemo(() => {
    const base = Array.isArray(resolved.images) ? resolved.images : [];
    return base.length >= 3 ? base : [...base, ProdutImg2, ProdutImg3].slice(0, 3);
  }, [resolved.images]);

  return (
    <div className='ProductCradContainer'>
      <div 
      className={`ProductCrad`}
      onClick={handleCardClick}
  >

          <div className='card-favorite'>
            <FavoriteButton value={isLiked} onChange={handleLikeChange} />
          </div>
          
          {/* Discount Badge */}
          {resolved.discount > 0 && (
            <div className='card-deal-badge'>-{Math.round(resolved.discount)}%</div>
          )}
          
          {/* New Badge - Shows even with discount */}
          {resolved.isNew && (
            <div className='card-state'>New !</div>
          )}

          {/* Last Minute Badge - 24h or less remaining */}
          {resolved.isLastMinute && (
            <div className='card-last-minute'>🔥 Dernière Minute</div>
          )}

          {/* Trendy Badge - 10+ likes */}
          {resolved.isTrendy && (
            <div className='card-trendy'>🔥 Tendance</div>
          )}

          <div className='ProdcutImg'>
              <img src={images[0]} alt="Product Image" />
          </div>
          <div className='P-Name'>
              <p>{resolved.name}</p>
              <p>{resolved.brand}</p>
          </div>
          <div className='P-Price'>
              {resolved.discount > 0 ? (
                <>
                  <p className='price-final'>{resolved.finalPriceLabel}</p>
                  <p className='price-original'>{resolved.originalPriceLabel}</p>
                </>
              ) : (
                <p className='price-final'>{resolved.originalPriceLabel}</p>
              )}
          </div>

          <div className='card-meta'>
            {typeof likesCount === 'number' ? (
              <span className='card-likes'>{likesCount} likes</span>
            ) : null}
          </div>

      </div>

      {showPopup && (
        <div className="product-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="product-popup" onClick={e => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={() => setShowPopup(false)}>×</button>
            
            <div className="popup-content">
              {/* Image Gallery Section */}
              <div className="popup-image-gallery">
                <div className="main-image">
                  <img src={images[selectedImage]} alt={resolved.name} />
                </div>
                <div className="thumbnail-images">
                  {images.map((img, idx) => (
                    <div className="thumbnail-wrapper" key={idx}>
                      <img
                        src={img}
                        alt={resolved.name}
                        className={`thumbnail${selectedImage === idx ? ' active' : ''}`}
                        onClick={() => setSelectedImage(idx)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details Section */}
              <div className="popup-product-details">
                <div className="product-header">
                  <div className="title-row">
                    <h2 className="product-title">{resolved.name}</h2>
                    <div className="popup-like" title={isLiked ? 'Saved' : 'Save'}>
                      <FavoriteButton value={isLiked} onChange={handleLikeChange} />
                      <span className="popup-like-text">{isLiked ? 'Saved' : 'Save'}</span>
                    </div>
                  </div>
                  <div className="product-brand">{resolved.brand}</div>

                  <div className="deal-row">
                    {resolved.discount > 0 ? (
                      <span className="deal-chip">-{Math.round(resolved.discount)}% OFF</span>
                    ) : null}
                    {resolved.timeLeft ? (
                      <span className={`timeleft-chip ${resolved.timeLeft.tone}`}>{resolved.timeLeft.label}</span>
                    ) : null}
                    {typeof likesCount === 'number' ? (
                      <span className="likes-chip">{likesCount} likes</span>
                    ) : null}
                  </div>

                  <div className="product-price">
                    {resolved.discount > 0 ? (
                      <>
                        <span className="popup-price-final">{resolved.finalPriceLabel}</span>
                        <span className="popup-price-original">{resolved.originalPriceLabel}</span>
                      </>
                    ) : (
                      <span className="popup-price-final">{resolved.originalPriceLabel}</span>
                    )}
                  </div>
                </div>

                <div className="product-description">
                  <h3>Description</h3>
                  <p>{resolved.description || 'No description available.'}</p>
                </div>

                <div className="product-specs">
                  <h3>Specifications</h3>
                  <div className="specs-grid">
                    
                    <div className="spec-item spec-item-categories">
                      <span className="spec-label">Categories:</span>
                      <div className="spec-value categories-wrapper">
                        {resolved.categories.length > 0 ? (
                          resolved.categories.map((cat, idx) => (
                            <span key={idx} className="category-tag">{cat}</span>
                          ))
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Brand:</span>
                      <span className="spec-value">{resolved.brand}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Ends:</span>
                      <span className="spec-value">{resolved.timeLeft?.label ?? '-'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Discount:</span>
                      <span className="spec-value">{resolved.discount ? `${Math.round(resolved.discount)}%` : '-'}</span>
                    </div>

                  </div>
                </div>

                <div className="product-actions">
                  {resolved.companyPagePath ? (
                    <button
                      className="action-btn primary"
                      onClick={() => {
                        // Track company click
                        const cid = product?.companyId || product?.companyID;
                        if (cid) companyAPI.click(cid).catch(() => {});
                        setShowPopup(false);
                        navigate(resolved.companyPagePath);
                      }}
                      title="Open company page"
                    >
                      View Company Page
                    </button>
                  ) : null}

                  <button
                    className={`action-btn ${isFollowing ? 'following' : 'secondary'}`}
                    onClick={handleFollowClick}
                  >
                    {isFollowing ? 'Following' : 'Follow Company'}
                  </button>

                  {resolved.link ? (
                    <a
                      className="action-btn secondary"
                      href={resolved.link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        // Track product click on external link
                        const pid = product?.id;
                        if (pid) productAPI.click(pid).catch(() => {});
                        setShowPopup(false);
                      }}
                      title="Open promotion on company website"
                    >
                      View Promotion on Company Site
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Prompt for guests */}
      {showAuthPrompt && (
        <div className="product-popup-overlay" onClick={() => setShowAuthPrompt(false)}>
          <div className="product-popup auth-prompt-popup" onClick={e => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={() => setShowAuthPrompt(false)}>×</button>
            <div className="auth-prompt-content">
              <div className="auth-prompt-icon">🔒</div>
              <h2>Sign in to view this promotion</h2>
              <p>Create a free account or sign in to access product details, follow companies, and save your favorite promotions.</p>
              <div className="auth-prompt-actions">
                <button
                  className="action-btn primary"
                  onClick={() => {
                    setShowAuthPrompt(false);
                    navigate('/connection');
                  }}
                >
                  Sign In
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    setShowAuthPrompt(false);
                    navigate('/registration');
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
