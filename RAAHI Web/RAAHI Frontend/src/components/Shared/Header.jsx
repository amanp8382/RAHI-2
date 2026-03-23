import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header = ({ onPageChange, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = (pageId) => {
    onPageChange(pageId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          RAAHI
        </Link>
        <nav className="nav-desktop">
          <a href="#home" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => handleLinkClick('home')}>Home</a>
          <a href="#dashboard" className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => handleLinkClick('dashboard')}>Tourist Dashboard</a>
          <a href="#help" className={`nav-link ${currentPage === 'help' ? 'active' : ''}`} onClick={() => handleLinkClick('help')}>Help & Support</a>
          <a href="#emergency-dashboard" className={`nav-link ${currentPage === 'emergency-dashboard' ? 'active' : ''}`} onClick={() => handleLinkClick('emergency-dashboard')}>🚨 Emergency Dashboard</a>
          <div className="language-selector">
            <svg className="globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <select id="language-select">
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமিழ্</option>
            </select>
          </div>
          <div className="header-buttons">
            <Link to="/login.html" className="btn btn-outline btn-sm">Login</Link>
          </div>
        </nav>
        <button className="mobile-menu-toggle" aria-label="Toggle navigation" onClick={toggleMobileMenu}>
          <span className="hamburger"></span>
        </button>
      </div>
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <a href="#home" className="mobile-nav-link" data-page="home" onClick={() => handleLinkClick('home')}>Home</a>
          <a href="#dashboard" className="mobile-nav-link" data-page="dashboard" onClick={() => handleLinkClick('dashboard')}>Tourist Dashboard</a>
          <a href="#help" className="mobile-nav-link" data-page="help" onClick={() => handleLinkClick('help')}>Help & Support</a>
          <a href="#emergency-dashboard" className="mobile-nav-link" data-page="emergency-dashboard" onClick={() => handleLinkClick('emergency-dashboard')}>🚨 Emergency Dashboard</a>
          <div className="mobile-language-selector">
            <svg className="globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <select>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமழ</option>
            </select>
          </div>
          <div className="mobile-header-buttons">
            <Link to="/login.html" className="btn btn-outline btn-sm">Login</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;