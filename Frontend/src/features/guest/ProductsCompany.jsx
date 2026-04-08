import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductCard from '@components/ProductCard'
import './ProductsCompany.css'
import { Globe, Users, TrendingUp, ExternalLink, UserPlus, UserCheck } from 'lucide-react'
import { useCompanyPublic } from '@shared/hooks/useProducts'
import { companyAPI, userAPI } from '@shared/api'
import { useAuth } from '@context/AuthContext'
import { useUserInteractions } from '@context/UserInteractionsContext'

export default function ProductsCompany() {
  const { company } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFollowingCompany, setFollowing: syncFollowing } = useUserInteractions();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [displayFollowers, setDisplayFollowers] = useState(0);

  const { company: companyInfo, products: Products, loading, error } = useCompanyPublic(company);

  // Sync followers count from API
  useEffect(() => {
    setDisplayFollowers(companyInfo?.followers ?? 0);
  }, [companyInfo?.followers]);

  // Sync follow state from context (loads from DB on auth)
  useEffect(() => {
    if (!isAuthenticated || !companyInfo?.id) return;
    setIsFollowing(isFollowingCompany(companyInfo.id));
  }, [isAuthenticated, companyInfo?.id, isFollowingCompany]);

  // Track company page visit as a company click
  useEffect(() => {
    if (companyInfo?.id) {
      companyAPI.click(companyInfo.id).catch(() => {});
    }
  }, [companyInfo?.id]);

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      navigate('/connection');
      return;
    }
    if (!companyInfo?.id || followLoading) return;

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setDisplayFollowers(prev => wasFollowing ? Math.max(0, prev - 1) : prev + 1);
    setFollowLoading(true);

    try {
      if (wasFollowing) {
        await userAPI.unfollowCompany(companyInfo.id);
      } else {
        await userAPI.followCompany(companyInfo.id);
      }
      // Sync context so other components update too
      syncFollowing(companyInfo.id, !wasFollowing);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setIsFollowing(wasFollowing);
      setDisplayFollowers(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading company...</p>
      </div>
    );
  }

  if (!companyInfo && !Products.length) {
    return (
      <div className="company-not-found">
        <h2>Company Not Found</h2>
        <p>The company you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="back-home-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="company-page">
      {/* Hero Section with Company Banner */}
      <div className="company-hero">
        <div className="company-hero-overlay"></div>
        <div className="company-hero-content">
          <div className="company-logo-wrapper">
            {companyInfo?.image && (
              <img 
                src={companyInfo.image} 
                alt={companyInfo.name} 
                className="company-logo-large"
              />
            )}
          </div>
          <div className="company-hero-info">
            <h1 className="company-name-hero">{companyInfo?.name || company}</h1>
            <p className="company-handle">{companyInfo?.handle}</p>
            <div className="company-stats-inline">
              <div className="stat-item">
                <Users size={18} />
                <span>{displayFollowers} Followers</span>
              </div>
              <div className="stat-item">
                <TrendingUp size={18} />
                <span>{Products.length} Active Deals</span>
              </div>
            </div>
            <button 
              className={`follow-company-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowClick}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={18} />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Follow Company</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Company Information Section */}
      <div className="company-info-section">
        <div className="container">
          <div className="company-details-grid">
            {/* About Company Card */}
            <div className="company-card about-card">
              <h2 className="card-title">About Company</h2>
              <div className="company-description">
                <p>
                  Welcome to {companyInfo?.name || company}, your trusted partner for amazing deals and promotions. 
                  Discover exclusive offers on high-quality products and services.
                </p>
              </div>

              {companyInfo?.CompanyLink && (
                <a 
                  href={companyInfo.CompanyLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="company-website-link"
                >
                  <Globe size={18} />
                  Visit Website
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="company-products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Active Promotions</h2>
            <p className="section-subtitle">
              Explore all current deals from {companyInfo?.name || company}
            </p>
          </div>

          {Products.length > 0 ? (
            <div className="items-Cards">
              {Products.map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  ProdutImg={product?.images?.[0]}
                  ProductName={product?.name}
                  mark={product?.companyName ?? product?.company}
                  ProductPrice={product?.price}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <TrendingUp size={48} />
              <h3>No Active Promotions</h3>
              <p>This company doesn't have any active promotions at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
