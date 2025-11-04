import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = ({ user, onLogout, onLogin, onSignup, isLoggedIn }) => {
  const { t, i18n } = useTranslation();
  const [showLang, setShowLang] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    setShowLang(false);
    
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lng;
    }
  };

  const getCurrentLanguage = () => {
    return languages.find(l => l.code === currentLanguage) || languages[0];
  };

  useEffect(() => {
    if (currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section - Always visible */}
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 72 72" fill="none">
                <path d="M52.5 20.5C52.5 26.575 47.575 31.5 41.5 31.5C35.425 31.5 30.5 26.575 30.5 20.5C30.5 14.425 35.425 9.5 41.5 9.5C47.575 9.5 52.5 14.425 52.5 20.5Z" fill="#95BF46"/>
                <path d="M20.5 52.5C20.5 58.575 15.575 63.5 9.5 63.5C3.425 63.5 -1.5 58.575 -1.5 52.5C-1.5 46.425 3.425 41.5 9.5 41.5C15.575 41.5 20.5 46.425 20.5 52.5Z" fill="#95BF46"/>
                <path d="M63.5 52.5C63.5 58.575 58.575 63.5 52.5 63.5C46.425 63.5 41.5 58.575 41.5 52.5C41.5 46.425 46.425 41.5 52.5 41.5C58.575 41.5 63.5 46.425 63.5 52.5Z" fill="#95BF46"/>
                <path d="M20.5 20.5C20.5 26.575 15.575 31.5 9.5 31.5C3.425 31.5 -1.5 26.575 -1.5 20.5C-1.5 14.425 3.425 9.5 9.5 9.5C15.575 9.5 20.5 14.425 20.5 20.5Z" fill="#95BF46"/>
              </svg>
            </div>
            <span className="logo-text">Shopify</span>
          </div>
          {!isMobile && <div className="tagline">Build your business</div>}
        </div>

        {/* Right Section - All in one row */}
        <div className="header-right">
          {/* Language Selector */}
          <div className="language-selector">
            <button
              className="language-button"
              onClick={() => setShowLang(!showLang)}
            >
              <span className="language-flag">{getCurrentLanguage().flag}</span>
              {!isMobile && (
                <span className="language-name">{getCurrentLanguage().nativeName}</span>
              )}
              <span className="language-arrow">⌄</span>
            </button>

            {showLang && (
              <>
                <div 
                  className="language-overlay"
                  onClick={() => setShowLang(false)}
                />
                <div className={`language-dropdown ${isMobile ? 'mobile-dropdown' : ''}`}>
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <span className="option-flag">{lang.flag}</span>
                      <div className="option-text">
                        <span className="option-native">{lang.nativeName}</span>
                        {!isMobile && (
                          <span className="option-english">{lang.name}</span>
                        )}
                      </div>
                      {currentLanguage === lang.code && (
                        <span className="option-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="auth-section">
            {isLoggedIn && user ? (
              <div className="user-section">
                {!isMobile && (
                  <div className="user-info">
                    <span className="welcome-text">
                      {t('welcome')}, <span className="username">{user.name || user.username}</span>
                    </span>
                  </div>
                )}
                <button
                  className="logout-btn"
                  onClick={onLogout}
                >
                  {isMobile ? 'logout' : <span className="logout-icon">→</span>}
                  {!isMobile && t('logout')}
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="login-btn"
                  onClick={onLogin}
                >
                  {isMobile ? 'login' : <span className="btn-icon">→</span>}
                  {!isMobile && t('login')}
                </button>
                <button
                  className="signup-btn"
                  onClick={onSignup}
                >
                  {isMobile ? 'signup' : <span className="btn-icon">+</span>}
                  {!isMobile && t('signup')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;