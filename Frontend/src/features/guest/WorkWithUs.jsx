import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@assets/PromoDzLogo.svg';
import './WorkWithUs.css';

const benefits = [
  {
    icon: '📈',
    title: 'Boost Your Visibility',
    description: 'Get your brand in front of thousands of active deal seekers across Algeria every day.'
  },
  {
    icon: '🎯',
    title: 'Targeted Audience',
    description: 'Reach customers who are already looking for the best deals and promotions in your category.'
  },
  {
    icon: '💰',
    title: 'Affordable Plans',
    description: 'Flexible promotion packages to fit every budget — from startups to established brands.'
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    description: 'Track clicks, views, and engagement with a dedicated company dashboard.'
  },
  {
    icon: '🤝',
    title: 'Dedicated Support',
    description: 'Our team helps you optimize campaigns and maximize your return on investment.'
  },
  {
    icon: '🚀',
    title: 'Fast Onboarding',
    description: 'Contact us, we set up your company profile, and you start publishing deals within minutes.'
  },
];

const steps = [
  {
    number: '01',
    title: 'Contact Us',
    description: 'Reach out via phone, email, or our contact form. Tell us about your business and goals.',
  },
  {
    number: '02',
    title: 'We Create Your Account',
    description: 'Our team sets up your company profile with your logo, description, and all your details.',
  },
  {
    number: '03',
    title: 'Start Publishing Deals',
    description: 'Log in to your dashboard and start posting promotions to reach thousands of customers.',
  },
  {
    number: '04',
    title: 'Grow Your Business',
    description: 'Leverage analytics, ratings, and featured placements to scale your reach.',
  },
];

const stats = [
  { number: '50K+', label: 'Active Users' },
  { number: '500+', label: 'Partner Companies' },
  { number: '1M+', label: 'Monthly Visits' },
  { number: '95%', label: 'Satisfaction Rate' },
];

export default function WorkWithUs() {
  return (
    <div className="workwithus-page">

      {/* Hero Section */}
      <section className="wwu-hero">
        <div className="wwu-hero-bg">
          <div className="wwu-circle wwu-circle-1"></div>
          <div className="wwu-circle wwu-circle-2"></div>
          <div className="wwu-circle wwu-circle-3"></div>
        </div>
        <div className="wwu-hero-content">
          <div className="wwu-hero-text">
            <div className="wwu-badge">
              <span className="wwu-badge-icon">🏢</span>
              FOR COMPANIES
            </div>
            <h1 className="wwu-hero-title">
              <span className="wwu-highlight">Grow Your Business</span> With Promo DZ
            </h1>
            <p className="wwu-hero-subtitle">
              You stay at home, we find deals! Partner with Algeria's #1 daily deals platform 
              and reach thousands of customers looking for your products.
            </p>
            <div className="wwu-hero-notice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>To become a partner, please contact us first. We will create your company account for you.</span>
            </div>
            <div className="wwu-hero-actions">
              <Link to="/contact" className="wwu-btn-primary">
                Send Us a Message
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/promotion-plans" className="wwu-btn-secondary">
                View Plans
              </Link>
            </div>
          </div>
          <div className="wwu-hero-logo">
            <div className="wwu-logo-card">
              <img src={Logo} alt="Promo DZ" />
              <p className="wwu-logo-tagline">Les Meilleurs Prix pour Tous</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="wwu-benefits">
        <div className="wwu-section-header">
          <h2 className="wwu-section-title">Why Partner With Us?</h2>
          <p className="wwu-section-subtitle">
            Everything you need to promote your business and connect with customers
          </p>
        </div>
        <div className="wwu-benefits-grid">
          {benefits.map((benefit, idx) => (
            <div className="wwu-benefit-card" key={idx}>
              <div className="wwu-benefit-icon">{benefit.icon}</div>
              <h3 className="wwu-benefit-title">{benefit.title}</h3>
              <p className="wwu-benefit-desc">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="wwu-steps">
        <div className="wwu-section-header">
          <h2 className="wwu-section-title">How It Works</h2>
          <p className="wwu-section-subtitle">
            Get started in 4 simple steps
          </p>
        </div>
        <div className="wwu-steps-grid">
          {steps.map((step, idx) => (
            <div className="wwu-step-card" key={idx}>
              <div className="wwu-step-number">{step.number}</div>
              <h3 className="wwu-step-title">{step.title}</h3>
              <p className="wwu-step-desc">{step.description}</p>
              {idx < steps.length - 1 && <div className="wwu-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section className="wwu-contact">
        <div className="wwu-contact-bg">
          <div className="wwu-circle wwu-circle-4"></div>
          <div className="wwu-circle wwu-circle-5"></div>
        </div>
        <div className="wwu-contact-content">
          <h2 className="wwu-contact-title">Ready to Get Started?</h2>
          <p className="wwu-contact-subtitle">
            Contact us today and let's grow your business together
          </p>

          <div className="wwu-contact-cards">
            {/* Phone Card */}
            <a href="tel:+213676140305" className="wwu-contact-card">
              <div className="wwu-contact-icon wwu-contact-icon-phone">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="wwu-contact-info">
                <span className="wwu-contact-label">CALL CENTRE</span>
                <span className="wwu-contact-value">+213 6 761 403 05</span>
              </div>
            </a>

            {/* Email Card */}
            <a href="mailto:contact@promo-dz.com" className="wwu-contact-card">
              <div className="wwu-contact-icon wwu-contact-icon-email">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                </svg>
              </div>
              <div className="wwu-contact-info">
                <span className="wwu-contact-label">EMAIL US</span>
                <span className="wwu-contact-value">contact@promo-dz.com</span>
              </div>
            </a>

            {/* Website Card */}
            <a href="https://www.promo-dz.com" target="_blank" rel="noopener noreferrer" className="wwu-contact-card">
              <div className="wwu-contact-icon wwu-contact-icon-web">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01.214 4.772 17.165 17.165 0 005.07-2.477zm-2.193 4.258a9.727 9.727 0 01-3.622 3.088 11.35 11.35 0 00-1.96-4.098 17.27 17.27 0 005.582.99v.02zM12 2.25c.268 0 .534.01.798.028a12.748 12.748 0 00-1.962 6.476 18.967 18.967 0 01-4.59-1.21A9.725 9.725 0 0112 2.25zM2.278 12.75a9.712 9.712 0 005.074 2.476 19.027 19.027 0 00.214-4.774 12.714 12.714 0 01-4.34-2.708 9.7 9.7 0 00-.949 5.006zm.948 3.258a9.727 9.727 0 003.622 3.088 11.347 11.347 0 011.96-4.098 17.27 17.27 0 01-5.582.99v.02zM12 21.75a9.714 9.714 0 01-5.246-5.294 12.698 12.698 0 004.59-1.214 18.96 18.96 0 001.96 6.476A9.374 9.374 0 0112 21.75zm1.604-.032a18.96 18.96 0 00-1.96-6.476 12.7 12.7 0 004.59 1.21A9.727 9.727 0 0112 21.75h1.604z"/>
                </svg>
              </div>
              <div className="wwu-contact-info">
                <span className="wwu-contact-label">VISIT WEBSITE</span>
                <span className="wwu-contact-value">www.promo-dz.com</span>
              </div>
            </a>
          </div>

          <div className="wwu-cta-buttons">
            <Link to="/contact" className="wwu-btn-primary wwu-btn-lg">
              Send Us a Message
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/promotion-plans" className="wwu-btn-outline">
              View Our Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
