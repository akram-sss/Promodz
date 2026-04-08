import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import "./Navbar.css"
import People from "@assets/Nav-people.svg"
import Search from "@assets/Nav-search.svg"
import Logo from "@assets/PromoDzLogo.svg"
import SearchModal from './SearchModal'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <div className='Navbar-Section'>
          <div className='Navbar-Logo'>
              <img src={Logo} alt="Logo" />
          </div>
        <nav className={`Navbar-Links ${menuOpen ? 'open' : ''}`} aria-label="Primary">
              <ul className="Navbar-list">
            <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Home</NavLink></li>
            <li><NavLink to="/explore" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Explore</NavLink></li>
            <li><NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Products</NavLink></li>
            <li><NavLink to="/work-with-us" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Work With Us</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Contact</NavLink></li>
              </ul>
          </nav>
          <div className='Navbar-Buttons'>
          <button
          className='Navbar-button Navbar-menu-button'
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
          >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
              <button className='Navbar-button' onClick={() => setShowSearch(true)}>
                  <img src={Search} alt="S"/>
              </button>
              <button className='Navbar-button' onClick={() => { handleNav("/connection") }}>
                  <img src={People} alt="P"/>
              </button>
          </div>
      </div>
      
      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
        />
      )}
    </>
  )
}
