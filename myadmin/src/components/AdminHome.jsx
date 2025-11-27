import React, { useState, useEffect } from 'react';
import './AdminHome.css';

const AdminHome = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Users',
      value: '0',
      change: 'Loading...',
      icon: 'fas fa-users',
      color: 'primary'
    },
    {
      title: 'Active Tasks',
      value: '0',
      change: 'Loading...',
      icon: 'fas fa-tasks',
      color: 'secondary'
    },
    {
      title: 'Total Transactions',
      value: '$0',
      change: 'Loading...',
      icon: 'fas fa-dollar-sign',
      color: 'success'
    },
    {
      title: 'Total Deposits',
      value: '$0',
      change: 'Loading...',
      icon: 'fas fa-wallet',
      color: 'info'
    }
  ]);

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Fetch users count
      const usersResponse = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let usersCount = 0;
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        usersCount = usersData.users ? usersData.users.length : 0;
      }

      // Fetch deposits
      const depositsResponse = await fetch(`${apiUrl}/api/admin/deposits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let totalDeposits = 0;
      let depositsCount = 0;
      if (depositsResponse.ok) {
        const depositsData = await depositsResponse.json();
        depositsCount = depositsData.deposits ? depositsData.deposits.length : 0;
        totalDeposits = depositsData.deposits ?
          depositsData.deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0) : 0;
      }

      // Fetch withdrawals
      const withdrawalsResponse = await fetch(`${apiUrl}/api/admin/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let pendingWithdrawalsCount = 0;
      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json();
        // Count only pending withdrawals
        pendingWithdrawalsCount = withdrawalsData.withdrawals ?
          withdrawalsData.withdrawals.filter(w => w.status === 'pending').length : 0;
      }

      // Update stats with real data
      setStats([
        {
          title: 'Total Users',
          value: usersCount.toString(),
          change: 'Real data',
          icon: 'fas fa-users',
          color: 'primary'
        },
        {
          title: 'Total Deposits',
          value: depositsCount.toString(),
          change: 'Real data',
          icon: 'fas fa-wallet',
          color: 'secondary'
        },
        {
          title: 'Total Transactions',
          value: `$${(totalDeposits + withdrawalsCount * 10).toLocaleString()}`,
          change: 'Real data',
          icon: 'fas fa-dollar-sign',
          color: 'success'
        },
        {
          title: 'Pending Withdrawals',
          value: pendingWithdrawalsCount.toString(),
          change: 'Real data',
          icon: 'fas fa-clock',
          color: 'info'
        }
      ]);

      // Create recent activities from real data
      const activities = [];
      if (usersCount > 0) {
        activities.push({
          user: 'System',
          action: `Total registered users: ${usersCount}`,
          time: 'Just now',
          type: 'user'
        });
      }
      if (depositsCount > 0) {
        activities.push({
          user: 'System',
          action: `Total deposits: ${depositsCount}`,
          time: 'Just now',
          type: 'transaction'
        });
      }
      if (withdrawalsCount > 0) {
        activities.push({
          user: 'System',
          action: `Pending withdrawals: ${withdrawalsCount}`,
          time: 'Just now',
          type: 'withdrawal'
        });
      }

      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep default data on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-home">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard data...</p>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && (
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
      )}

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