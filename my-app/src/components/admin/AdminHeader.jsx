import React from 'react';

const AdminHeader = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`fas fa-${sidebarCollapsed ? 'bars' : 'times'}`}></i>
          </button>
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>

        <div className="admin-header-right">
          <div className="admin-notifications">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span className="admin-name">Admin User</span>
            <button className="admin-dropdown-btn">
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;