import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import "./Home.css"
import DealsCard from '@components/DealsCard'
import TopCompaniesCarousel from '@components/TopCompaniesCarousel'
import PurpleLine from '@components/PurpleLine'
import ProductCard from '@components/ProductCard'
import FilterComp from '@components/Filter/FilterComp'
import Homekhorti1 from '@assets/HomeKhorti1.svg'
import ItemsProducts from '@components/ItemsProdcuts/ItemsProducts'
import Marques from '@components/Ads/Marques'
import { useActiveProducts, usePopularProducts, useRecommendedProducts } from '@shared/hooks/useProducts'
import { topCompanyAPI } from '@shared/api'
import { useAuth } from '@context/AuthContext'

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [topCompanies, setTopCompanies] = useState([]);
  const heroRef = useRef(null);

  const { products: activeProducts, loading: loadingActive } = useActiveProducts();
  const { products: popularProducts, loading: loadingPopular } = usePopularProducts();
  const { products: recommendedProducts, loading: loadingRecommended } = useRecommendedProducts(isAuthenticated);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    topCompanyAPI.getAll()
      .then(res => setTopCompanies(res.data || []))
      .catch(() => setTopCompanies([]));
  }, []);

  const products = activeProducts.slice(0, 6);
  const trendyProducts = popularProducts.length > 0 ? popularProducts.slice(0, 12) : activeProducts.slice(0, 12);

  const handleExploreDeals = () => {
    navigate('/explore');
  };

  const handleSearchProducts = () => {
    navigate('/products');
  };

  return (
    <div className="Home-Container">
      {/* Hero Section */}
      <section className={`hero-section ${isVisible ? 'visible' : ''}`} ref={heroRef}>
        {/* Background Decorations */}
        <div className="hero-bg">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="hero-wrapper">
          {/* Left Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <div className='badge-text'>New deals added daily</div>
            </div>

            <h1 className="hero-title">
              Find the <span className="gradient-text">Best Deals</span> in Algeria
            </h1>

            <p className="hero-description">
              Your one-stop destination for exclusive discounts, flash sales, and unbeatable offers from top Algerian brands.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleExploreDeals}>
                <span>Explore Deals</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="btn-secondary" onClick={handleSearchProducts}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Browse Products</span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">500+</span>
                <span className="stat-label">Active Deals</span>
              </div>
              <div className="stat-separator"></div>
              <div className="stat">
                <span className="stat-value">100+</span>
                <span className="stat-label">Partner Brands</span>
              </div>
              <div className="stat-separator"></div>
              <div className="stat">
                <span className="stat-value">50K+</span>
                <span className="stat-label">Happy Users</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hero-visual">
            <div className="visual-glow"></div>
            <img 
              src={Homekhorti1} 
              alt="Promo DZ - Best Deals in Algeria" 
              className="hero-image"
            />
            
            {/* Floating Elements */}
            <div className="float-card float-discount">
              <div className="float-icon">🏷️</div>
              <div className="float-info">
                <span className="float-value">-70%</span>
                <span className="float-label">Max Discount</span>
              </div>
            </div>

            <div className="float-card float-brands">
              <div className="float-icon">🛍️</div>
              <div className="float-info">
                <span className="float-value">100+</span>
                <span className="float-label">Top Brands</span>
              </div>
            </div>

            <div className="float-card float-savings">
              <div className="float-icon">💰</div>
              <div className="float-info">
                <span className="float-value">Save Big</span>
                <span className="float-label">Every Day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Carousel */}
      <TopCompaniesCarousel companies={topCompanies} />

      {/* Brand Marquee */}
      <Marques />

      {/* Filter Section */}
      <FilterComp />

      {/* Personalized Recommendations (authenticated users only) */}
      {isAuthenticated && recommendedProducts.length > 0 && (
        <section className="products-section recommended">
          <ItemsProducts title={"RECOMMENDED FOR YOU - RECOMMANDÉ POUR VOUS"} Products={recommendedProducts} />
        </section>
      )}

      {/* Last Minute Deals */}
      <section className="products-section last-minute">
        <ItemsProducts title={"LAST MINUTE - DERNIERE MINUTE"} Products={products} />
      </section>

      {/* Trendy Products */}
      <section className="products-section trendy">
        <ItemsProducts title={"TRENDY PRODUCTS - PRODUITS TENDANCE"} Products={trendyProducts} />
      </section>
    </div>
  )
}
