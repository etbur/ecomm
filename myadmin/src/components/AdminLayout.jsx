import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children, activePage, setActivePage, onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className={`admin-layout ${isMobile && sidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      <AdminHeader
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={handleSidebarToggle}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        onLogout={onLogout}
      />
      <div className="admin-content-wrapper">
        <AdminSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={sidebarCollapsed}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`admin-main ${sidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;