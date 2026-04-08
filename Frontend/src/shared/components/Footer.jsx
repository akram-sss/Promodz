import React from 'react'
import './Footer.css'
import Logo from '@assets/PromoDzLogo.svg'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className='footer-section'>
      <div className='footer-container'>
        <div className='footer-logo-social'>
          {/* Logo */}
          <div className='footer-logo'>
            <img src={Logo} alt="Logo" />
          </div>

          {/* Social Icons */}
          <div className='footer-social'>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="24" height="24" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="24" height="24" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
            {/* X (Twitter) */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg width="24" height="24" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20"/></svg>
            </a>
          </div>
        </div>
        <div className='footer-links'>
          <div className='footer-col'>
            <h4>Support</h4>
            <ul>
              <li><a href="/contact">Contact Us</a></li>
              <li><Link to="/termsandprivacy">Privacy Policy</Link></li>
              <li><Link to="/termsandprivacy">Terms of Service</Link></li>
            </ul>
          </div>
          <div className='footer-col'>
            <h4>For Companies</h4>
            <ul>
              <li><Link to="/promotion-plans">Promotion Plans</Link></li>
              <li><Link to="/work-with-us">Partner With Us</Link></li>
              <li><a href="/contact">Business Support</a></li>
            </ul>
          </div>
          <div className='footer-col'>
            <h4>Legal</h4>
            <ul>
              <li><Link to="/termsandprivacy">Privacy Policy</Link></li>
              <li><Link to="/termsandprivacy">Terms of Service</Link></li>
            </ul>
          </div>
          <div className='footer-col'>
            <h4>Follow Us</h4>
            <ul>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className='footer-bottom'>
        <p>© {new Date().getFullYear()} PromoDZ. All rights reserved. Made with ❤️ in Algeria.</p>
      </div>
    </footer>
  )
}
