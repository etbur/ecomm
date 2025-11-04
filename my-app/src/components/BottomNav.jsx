import React from 'react';

const BottomNav = ({ activePage, setActivePage }) => {
  const navItems = [
    
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    window.scrollTo(0, 0);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <a
          key={item.id}
          href="#"
          className={`nav-item ${activePage === item.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            handleNavClick(item.id);
          }}
        >
          <div className="nav-icon">
            <i className={item.icon}></i>
          </div>
          <div className="nav-text">{item.text}</div>
        </a>
      ))}
    </nav>
  );
};

export default BottomNav;