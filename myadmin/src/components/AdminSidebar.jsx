import React from 'react';

const AdminSidebar = ({ activePage, setActivePage, collapsed, isMobile, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    {
      id: 'admin-home',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: 'admin-home'
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: 'fas fa-users',
      path: 'admin-users'
    },
    {
      id: 'admin-tasks',
      label: 'Tasks',
      icon: 'fas fa-tasks',
      path: 'admin-tasks'
    },
    {
      id: 'admin-user-tasks',
      label: 'User Tasks',
      icon: 'fas fa-check-circle',
      path: 'admin-user-tasks'
    },
    {
      id: 'admin-transactions',
      label: 'Transactions',
      icon: 'fas fa-exchange-alt',
      path: 'admin-transactions'
    },
    {
      id: 'admin-voucher',
      label: 'Vouchers',
      icon: 'fas fa-rocket',
      path: 'admin-voucher'
    },
    {
      id: 'admin-withdrawals',
      label: 'Withdrawals',
      icon: 'fas fa-money-bill-wave',
      path: 'admin-withdrawals'
    },
    {
      id: 'admin-deposits',
      label: 'Deposits',
      icon: 'fas fa-plus-circle',
      path: 'admin-deposits'
    },
    {
      id: 'admin-communication',
      label: 'Communication',
      icon: 'fas fa-comments',
      path: 'admin-communication'
    },
    {
      id: 'admin-settings',
      label: 'Settings',
      icon: 'fas fa-cog',
      path: 'admin-settings'
    }
  ];

  const handleMenuClick = (path) => {
    setActivePage(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`admin-sidebar ${collapsed && !isMobile ? 'collapsed' : ''} ${isMobile ? (sidebarOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>
    
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              <button
                className={`sidebar-menu-btn ${activePage === item.path ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.path)}
                title={(collapsed && !isMobile) || isMobile ? item.label : ''}
              >
                <i className={item.icon}></i>
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" title={collapsed ? 'Logout' : ''}>
          <i className="fas fa-sign-out-alt"></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;