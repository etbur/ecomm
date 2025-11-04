import React, { useState } from 'react';

const AdminVentures = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const ventures = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      category: 'web',
      status: 'active',
      investment: '$15,000',
      roi: '45%',
      users: 1250,
      description: 'Modern e-commerce solution with advanced analytics',
      technologies: ['React', 'Node.js', 'MongoDB'],
      launchDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Fitness Mobile App',
      category: 'mobile',
      status: 'development',
      investment: '$25,000',
      roi: '0%',
      users: 0,
      description: 'Comprehensive fitness tracking and social features',
      technologies: ['React Native', 'Firebase', 'ML Kit'],
      launchDate: 'TBD'
    },
    {
      id: 3,
      title: 'AI Learning Platform',
      category: 'education',
      status: 'planning',
      investment: '$50,000',
      roi: '0%',
      users: 0,
      description: 'AI-powered personalized learning experience',
      technologies: ['Next.js', 'Python', 'TensorFlow'],
      launchDate: 'TBD'
    },
    {
      id: 4,
      title: 'Restaurant Management System',
      category: 'business',
      status: 'completed',
      investment: '$30,000',
      roi: '78%',
      users: 450,
      description: 'Complete restaurant management and POS system',
      technologies: ['Angular', 'Spring Boot', 'PostgreSQL'],
      launchDate: '2023-11-20'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Ventures', count: ventures.length },
    { id: 'web', label: 'Web Apps', count: ventures.filter(v => v.category === 'web').length },
    { id: 'mobile', label: 'Mobile Apps', count: ventures.filter(v => v.category === 'mobile').length },
    { id: 'business', label: 'Business Software', count: ventures.filter(v => v.category === 'business').length },
    { id: 'education', label: 'Education', count: ventures.filter(v => v.category === 'education').length }
  ];

  const filteredVentures = selectedCategory === 'all'
    ? ventures
    : ventures.filter(venture => venture.category === selectedCategory);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'development': return 'warning';
      case 'planning': return 'info';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  const totalInvestment = ventures.reduce((sum, v) => sum + parseFloat(v.investment.replace('$', '').replace(',', '')), 0);
  const activeVentures = ventures.filter(v => v.status === 'active').length;
  const totalUsers = ventures.reduce((sum, v) => sum + v.users, 0);

  return (
    <div className="admin-ventures">
      <div className="page-header">
        <h1>Venture Management</h1>
        <p>Track and manage all business ventures and projects</p>
      </div>

      {/* Venture Stats */}
      <div className="venture-stats">
        <div className="stat-card">
          <h3>${totalInvestment.toLocaleString()}</h3>
          <p>Total Investment</p>
        </div>
        <div className="stat-card">
          <h3>{activeVentures}</h3>
          <p>Active Ventures</p>
        </div>
        <div className="stat-card">
          <h3>{totalUsers.toLocaleString()}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{ventures.filter(v => v.status === 'completed').length}</h3>
          <p>Completed Projects</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
            <span className="category-count">{category.count}</span>
          </button>
        ))}
      </div>

      {/* Ventures Grid */}
      <div className="ventures-grid">
        {filteredVentures.map((venture) => (
          <div key={venture.id} className="venture-card">
            <div className="venture-header">
              <h3>{venture.title}</h3>
              <span className={`status-badge status-${getStatusColor(venture.status)}`}>
                {venture.status}
              </span>
            </div>

            <p className="venture-description">{venture.description}</p>

            <div className="venture-tech">
              {venture.technologies.map((tech, index) => (
                <span key={index} className="tech-tag">{tech}</span>
              ))}
            </div>

            <div className="venture-metrics">
              <div className="metric">
                <span className="metric-label">Investment:</span>
                <span className="metric-value">{venture.investment}</span>
              </div>
              <div className="metric">
                <span className="metric-label">ROI:</span>
                <span className="metric-value">{venture.roi}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Users:</span>
                <span className="metric-value">{venture.users.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Launch:</span>
                <span className="metric-value">{venture.launchDate}</span>
              </div>
            </div>

            <div className="venture-actions">
              <button className="action-btn view">
                <i className="fas fa-eye"></i> View Details
              </button>
              <button className="action-btn edit">
                <i className="fas fa-edit"></i> Edit
              </button>
              <button className="action-btn analytics">
                <i className="fas fa-chart-bar"></i> Analytics
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Venture Button */}
      <div className="add-venture-section">
        <button className="btn btn-primary btn-large">
          <i className="fas fa-plus"></i> Start New Venture
        </button>
      </div>
    </div>
  );
};

export default AdminVentures;