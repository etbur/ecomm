import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // You'll need to create this context

const Footer = ({ activePage, setActivePage }) => {
  const { user, isLoggedIn } = useAuth(); // Assuming you have auth context
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'products', icon: '🎮', label: 'Game' },
    { id: 'earn', icon: '💰', label: 'Referal' },
    { id: 'wallet', icon: '💼', label: 'Trade' },
    { id: 'profile', icon: '👤', label: 'Profile' }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="modern-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Company & Social Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <span className="footer-logo-icon">🛍️</span>
              <span className="footer-logo-text">Shopiy</span>
            </div>
            <p className="footer-description">
              Your premier destination for shopping and earning. Discover amazing products,
              complete simple tasks, and earn money with every purchase.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" title="Facebook">📘</a>
              <a href="#" className="social-link" title="Twitter">🐦</a>
              <a href="#" className="social-link" title="Instagram">📷</a>
              <a href="#" className="social-link" title="LinkedIn">💼</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#" onClick={() => handleNavClick('home')} className="footer-link">Trending Products</a></li>
              <li><a href="#" onClick={() => handleNavClick('products')} className="footer-link">All Products</a></li>
              <li><a href="#" onClick={() => handleNavClick('earn')} className="footer-link">Earn Money</a></li>
              <li><a href="#" className="footer-link">Daily Deals</a></li>
              <li><a href="#" className="footer-link">New Arrivals</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Help Center</a></li>
              <li><a href="#" className="footer-link">Contact Support</a></li>
              <li><a href="#" className="footer-link">Shipping Info</a></li>
              <li><a href="#" className="footer-link">Returns & Refunds</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">About Shopiy</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Our Story</a></li>
              <li><a href="#" className="footer-link">Careers</a></li>
              <li><a href="#" className="footer-link">Press & Media</a></li>
              <li><a href="#" className="footer-link">Affiliate Program</a></li>
              <li><a href="#" className="footer-link">Brand Partners</a></li>
            </ul>
          </div>

        </div>

        {/* Features Section */}
        <div className="footer-features">
          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <div>
                <h4 className="feature-title">Free Shipping</h4>
                <p className="feature-text">On orders over $50</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">↩️</span>
              <div>
                <h4 className="feature-title">Easy Returns</h4>
                <p className="feature-text">30-day return policy</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <div>
                <h4 className="feature-title">Secure Payment</h4>
                <p className="feature-text">100% protected</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <div>
                <h4 className="feature-title">Earn Rewards</h4>
                <p className="feature-text">Get paid to shop</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <div className="copyright-content">
            <p className="copyright-text">
              &copy; 2024 Shopiy. All rights reserved.
            </p>
            <div className="payment-methods">
              <span className="payment-icon">💳</span>
              <span className="payment-icon">📱</span>
              <span className="payment-icon">🏦</span>
              <span className="payment-icon">🔗</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>


      <style>{`
        .modern-footer {
          margin-top: auto;
          position: relative;
        }

        .footer-main {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #ffffff;
          padding: 60px 0 120px 0;
          border-top: 1px solid #475569;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 40px;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .footer-logo-icon {
          font-size: 2rem;
        }

        .footer-logo-text {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-description {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }

        .footer-social {
          display: flex;
          gap: 15px;
        }

        .social-link {
          display: inline-block;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          text-decoration: none;
        }

        .social-link:hover {
          background: rgba(102, 126, 234, 0.3);
          transform: translateY(-2px);
        }

        .footer-title {
          color: #ffffff;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
          display: inline-block;
          margin-bottom: 12px;
          cursor: pointer;
        }

        .footer-link:hover {
          color: #667eea;
        }

        /* Referral System Styles */
        .referral-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .referral-info {
          margin-bottom: 15px;
        }

        .referral-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .referral-label {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .referral-code {
          color: #ffffff;
          font-weight: 600;
          background: rgba(102, 126, 234, 0.3);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .referral-value {
          color: #ffffff;
          font-weight: 600;
        }

        .referral-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .btn-copy, .btn-share {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-copy {
          background: rgba(102, 126, 234, 0.3);
          color: #ffffff;
        }

        .btn-share {
          background: rgba(16, 185, 129, 0.3);
          color: #ffffff;
        }

        .btn-copy:hover, .btn-share:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-view-details {
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: transparent;
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-view-details:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Features Section */
        .footer-features {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px 20px;
          border-top: 1px solid #475569;
          border-bottom: 1px solid #475569;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .feature-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
          padding: 12px;
        }

        .feature-title {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 5px 0;
        }

        .feature-text {
          color: #cbd5e1;
          font-size: 0.85rem;
          margin: 0;
        }

        /* Copyright */
        .footer-copyright {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 20px 0;
        }

        .copyright-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .copyright-text {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }

        .payment-methods {
          display: flex;
          gap: 10px;
        }

        .payment-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        /* Bottom Navigation */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 8px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 60px;
          flex: 1;
          color: #64748b;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          transform: translateY(-2px);
          color: #ffffff;
        }

        .nav-item:hover:not(.active) {
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .nav-icon {
          font-size: 1.5rem;
          margin-bottom: 4px;
          transition: all 0.3s ease;
        }

        .nav-label {
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          color: #1e293b;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
        }

        .modal-body {
          padding: 20px;
        }

        .team-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: center;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e293b;
        }

        .team-list h4 {
          margin-bottom: 15px;
          color: #1e293b;
        }

        .team-members {
          max-height: 300px;
          overflow-y: auto;
        }

        .team-member {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .member-name {
          color: #1e293b;
          font-weight: 500;
        }

        .member-commission {
          color: #059669;
          font-weight: 600;
        }

        .no-members {
          text-align: center;
          color: #64748b;
          font-style: italic;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 0 15px;
          }

          .footer-main {
            padding: 40px 0 100px 0;
          }

          .feature-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
          }

          .footer-social {
            justify-content: center;
          }

          .copyright-content {
            justify-content: center;
            text-align: center;
            flex-direction: column;
          }

          .modal-content {
            margin: 10px;
          }

          .referral-actions {
            flex-direction: column;
          }

          .team-stats {
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
};

const styles = {
  footer: {
    marginTop: 'auto',
  },
  mainFooter: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    color: '#ffffff',
    padding: '60px 0 80px 0', // Extra padding at bottom for nav
    borderTop: '1px solid #475569',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  footerContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  logoIcon: {
    fontSize: '2rem',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  companyDescription: {
    color: '#cbd5e1',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontSize: '0.95rem',
  },
  socialLinks: {
    display: 'flex',
    gap: '15px',
  },
  socialLink: {
    display: 'inline-block',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontSize: '1.2rem',
    textDecoration: 'none',
  },
  columnTitle: {
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '20px',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  link: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.3s ease',
    display: 'inline-block',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  featuresSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px',
    padding: '40px 0',
    borderTop: '1px solid #475569',
    borderBottom: '1px solid #475569',
    marginBottom: '30px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  featureIcon: {
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '10px',
    padding: '10px',
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 5px 0',
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: '0.85rem',
    margin: 0,
  },
  copyright: {
    paddingTop: '20px',
    borderTop: '1px solid #475569',
  },
  copyrightContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  copyrightText: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
  },
  paymentMethods: {
    display: 'flex',
    gap: '10px',
  },
  paymentIcon: {
    fontSize: '1.5rem',
    opacity: '0.8',
  },
  // Bottom Navigation Styles
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '60px',
    flex: 1,
    color: '#64748b',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    transform: 'translateY(-2px)',
    color: '#ffffff',
  },
  navIcon: {
    fontSize: '1.5rem',
    marginBottom: '4px',
    transition: 'all 0.3s ease',
  },
  navLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
};

// Add hover effects
Object.assign(styles.link, {
  ':hover': {
    color: '#667eea',
  }
});

Object.assign(styles.socialLink, {
  ':hover': {
    background: 'rgba(102, 126, 234, 0.2)',
    transform: 'translateY(-2px)',
  }
});

Object.assign(styles.navItem, {
  ':hover': {
    background: '#f8fafc',
    transform: 'translateY(-1px)',
  }
});

Object.assign(styles.navItemActive, {
  ':hover': {
    background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
    transform: 'translateY(-2px)',
  }
});

export default Footer;