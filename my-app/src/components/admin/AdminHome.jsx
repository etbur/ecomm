import React from 'react';

const AdminHome = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: 'fas fa-users',
      color: 'primary'
    },
    {
      title: 'Active Tasks',
      value: '567',
      change: '+8%',
      icon: 'fas fa-tasks',
      color: 'secondary'
    },
    {
      title: 'Total Transactions',
      value: '$45,678',
      change: '+23%',
      icon: 'fas fa-dollar-sign',
      color: 'success'
    },
    {
      title: 'Projects Completed',
      value: '89',
      change: '+15%',
      icon: 'fas fa-check-circle',
      color: 'info'
    }
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'Completed task', time: '2 minutes ago', type: 'task' },
    { user: 'Jane Smith', action: 'Made transaction', time: '5 minutes ago', type: 'transaction' },
    { user: 'Bob Johnson', action: 'Joined platform', time: '10 minutes ago', type: 'user' },
    { user: 'Alice Brown', action: 'Started project', time: '15 minutes ago', type: 'project' }
  ];

  return (
    <div className="admin-home">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <i className={stat.icon}></i>
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <span className="stat-change">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Activities */}
        <div className="dashboard-section">
          <h2>Recent Activities</h2>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <i className={`fas fa-${activity.type === 'task' ? 'check' : activity.type === 'transaction' ? 'dollar-sign' : activity.type === 'user' ? 'user-plus' : 'rocket'}`}></i>
                </div>
                <div className="activity-content">
                  <p><strong>{activity.user}</strong> {activity.action}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">
              <i className="fas fa-user-plus"></i>
              Add User
            </button>
            <button className="action-btn">
              <i className="fas fa-tasks"></i>
              Create Task
            </button>
            <button className="action-btn">
              <i className="fas fa-chart-bar"></i>
              View Reports
            </button>
            <button className="action-btn">
              <i className="fas fa-cog"></i>
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;