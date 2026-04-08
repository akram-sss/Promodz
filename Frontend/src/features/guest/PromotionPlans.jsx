import React, { useState } from 'react';
import './PromotionPlans.css';
import Data from '@data/moc-data/Data';
import { Link } from 'react-router-dom';

export default function PromotionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0); // Start with first FAQ open
  const plans = Data.initialPlans || [];

  const getPlanColor = (index) => {
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    return colors[index] || '#8b5cf6';
  };

  const getPlanIcon = (index) => {
    if (index === 0) return '👑'; // Gold
    if (index === 1) return '⭐'; // Silver
    return '🎯'; // Bronze/Basic
  };

  return (
    <div className="promotion-plans-page">
      {/* Hero Section */}
      <div className="plans-hero">
        <div className="plans-hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🚀</span>
            FOR COMPANIES
          </div>
          <h1 className="plans-hero-title">Choose Your Perfect Plan</h1>
          <p className="plans-hero-subtitle">
            Boost your business visibility with our tailored promotion packages. 
            Reach thousands of potential customers across Algeria.
          </p>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle decoration-circle-1"></div>
          <div className="decoration-circle decoration-circle-2"></div>
          <div className="decoration-circle decoration-circle-3"></div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="plans-section">
        <div className="section-header">
          <h2 className="section-title">Our Promotion Packages</h2>
          <p className="section-subtitle">
            Select the plan that best fits your marketing goals and budget
          </p>
        </div>

        <div className="plans-grid">
          {plans.map((plan, index) => (
            <div 
              key={plan.id} 
              className={`plan-card ${selectedPlan === plan.id ? 'plan-card-selected' : ''} ${index === 0 ? 'plan-card-featured' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
              style={{ '--plan-color': getPlanColor(index) }}
            >
              {index === 0 && (
                <div className="plan-badge">
                  <span>MOST POPULAR</span>
                </div>
              )}
              
              <div className="plan-header">
                <div className="plan-icon">{getPlanIcon(index)}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-currency">DA</span>
                </div>
                <p className="plan-duration">per promotion campaign</p>
              </div>

              <div className="plan-features">
                <h4 className="features-title">What's Included:</h4>
                <ul className="features-list">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="feature-item">
                      <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="plan-cta-button">
                Choose {plan.name.split('–')[0].trim()}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2 className="section-title">Why Choose PromoDZ?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3 className="benefit-title">Targeted Reach</h3>
            <p className="benefit-description">
              Connect with customers actively searching for deals and promotions in their area.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📊</div>
            <h3 className="benefit-title">Analytics & Insights</h3>
            <p className="benefit-description">
              Track your promotion performance with real-time analytics and detailed reports.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🚀</div>
            <h3 className="benefit-title">Multi-Channel Promotion</h3>
            <p className="benefit-description">
              Get exposure across our website, mobile app, and social media platforms.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💎</div>
            <h3 className="benefit-title">Premium Visibility</h3>
            <p className="benefit-description">
              Stand out with featured placements and priority listing in search results.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h3 className="benefit-title">Dedicated Support</h3>
            <p className="benefit-description">
              Get assistance from our team to optimize your promotions and maximize ROI.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3 className="benefit-title">Quick Setup</h3>
            <p className="benefit-description">
              Launch your promotion in minutes with our easy-to-use platform.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Boost Your Business?</h2>
          <p className="cta-subtitle">
            Join hundreds of successful companies already promoting on PromoDZ
          </p>
          <div className="cta-buttons">
            <Link to="/work-with-us" className="cta-button cta-button-primary">
              Get Started Now
            </Link>
            <Link to="/contact" className="cta-button cta-button-secondary">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item" onClick={() => setExpandedFaq(expandedFaq === 0 ? null : 0)}>
            <div className="faq-question-header">
              <h3 className="faq-question">How long does a promotion campaign last?</h3>
              <span className="faq-toggle">{expandedFaq === 0 ? '−' : '+'}</span>
            </div>
            {expandedFaq === 0 ? (
              <div style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', marginTop: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#000000', fontSize: '16px', fontWeight: 'normal' }}>
                  Campaign duration varies by plan. Gold plans run for 7 days, Silver for 5 days, and Basic for 3 days. 
                  You can always renew or upgrade your plan.
                </div>
              </div>
            ) : null}
          </div>
          <div className="faq-item" onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}>
            <div className="faq-question-header">
              <h3 className="faq-question">Can I change my plan after purchasing?</h3>
              <span className="faq-toggle">{expandedFaq === 1 ? '−' : '+'}</span>
            </div>
            {expandedFaq === 1 ? (
              <div style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', marginTop: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#000000', fontSize: '16px', fontWeight: 'normal' }}>
                  Yes! You can upgrade your plan at any time. The price difference will be calculated and you'll 
                  get the benefits of the higher tier immediately.
                </div>
              </div>
            ) : null}
          </div>
          <div className="faq-item" onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}>
            <div className="faq-question-header">
              <h3 className="faq-question">What payment methods do you accept?</h3>
              <span className="faq-toggle">{expandedFaq === 2 ? '−' : '+'}</span>
            </div>
            {expandedFaq === 2 ? (
              <div style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', marginTop: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#000000', fontSize: '16px', fontWeight: 'normal' }}>
                  We accept all major payment methods including CIB cards, Edahabia, and bank transfers. 
                  Payment is secure and processed instantly.
                </div>
              </div>
            ) : null}
          </div>
          <div className="faq-item" onClick={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}>
            <div className="faq-question-header">
              <h3 className="faq-question">Do you offer discounts for multiple campaigns?</h3>
              <span className="faq-toggle">{expandedFaq === 3 ? '−' : '+'}</span>
            </div>
            {expandedFaq === 3 ? (
              <div style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', marginTop: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#000000', fontSize: '16px', fontWeight: 'normal' }}>
                  Yes! Companies purchasing multiple campaigns or committing to long-term partnerships receive 
                  special discounts. Contact our sales team for custom packages.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
