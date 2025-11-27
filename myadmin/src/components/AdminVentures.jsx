import React, { useState, useEffect } from 'react';

const AdminVentures = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVenture, setNewVenture] = useState({
    title: '',
    description: '',
    category: 'web',
    investment: '',
    status: 'planning',
    technologies: '',
    launchDate: ''
  });

  useEffect(() => {
    fetchVentures();
  }, []);

  const fetchVentures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/ventures', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ventures');
      }

      const data = await response.json();
      setVentures(data.ventures);
    } catch (error) {
      console.error('Error fetching ventures:', error);
      setError('Failed to load ventures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenture = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const ventureData = {
        ...newVenture,
        technologies: newVenture.technologies.split(',').map(tech => tech.trim()),
        investment: parseFloat(newVenture.investment)
      };

      const response = await fetch('http://localhost:5000/api/admin/ventures', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventureData)
      });

      if (!response.ok) {
        throw new Error('Failed to create venture');
      }

      const data = await response.json();
      setVentures([data.venture, ...ventures]);
      setShowCreateForm(false);
      setNewVenture({
        title: '',
        description: '',
        category: 'web',
        investment: '',
        status: 'planning',
        technologies: '',
        launchDate: ''
      });
    } catch (error) {
      console.error('Error creating venture:', error);
      setError('Failed to create venture');
    }
  };

  const handleDeleteVenture = async (ventureId) => {
    if (!window.confirm('Are you sure you want to delete this venture?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/ventures/${ventureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete venture');
      }

      setVentures(ventures.filter(venture => venture._id !== ventureId));
    } catch (error) {
      console.error('Error deleting venture:', error);
      setError('Failed to delete venture');
    }
  };

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

      {/* Create Venture Form */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Venture</h3>
              <button className="close-btn" onClick={() => setShowCreateForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateVenture}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newVenture.title}
                  onChange={(e) => setNewVenture({...newVenture, title: e.target.value})}
                  required
                  placeholder="Enter venture title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newVenture.description}
                  onChange={(e) => setNewVenture({...newVenture, description: e.target.value})}
                  required
                  placeholder="Enter venture description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newVenture.category}
                    onChange={(e) => setNewVenture({...newVenture, category: e.target.value})}
                  >
                    <option value="web">Web App</option>
                    <option value="mobile">Mobile App</option>
                    <option value="business">Business Software</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Investment ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={newVenture.investment}
                    onChange={(e) => setNewVenture({...newVenture, investment: e.target.value})}
                    required
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newVenture.status}
                    onChange={(e) => setNewVenture({...newVenture, status: e.target.value})}
                  >
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Launch Date</label>
                  <input
                    type="date"
                    value={newVenture.launchDate}
                    onChange={(e) => setNewVenture({...newVenture, launchDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={newVenture.technologies}
                  onChange={(e) => setNewVenture({...newVenture, technologies: e.target.value})}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Venture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading ventures...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchVentures} className="btn btn-primary">
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      )}

      {/* Ventures Grid */}
      {!loading && !error && (
        <div className="ventures-grid">
          {filteredVentures.map((venture) => (
            <div key={venture._id} className="venture-card">
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
                  <span className="metric-value">${venture.investment.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">ROI:</span>
                  <span className="metric-value">{venture.roi || '0%'}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Users:</span>
                  <span className="metric-value">{venture.users.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Launch:</span>
                  <span className="metric-value">{venture.launchDate || 'TBD'}</span>
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
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteVenture(venture._id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}

          {filteredVentures.length === 0 && (
            <div className="no-ventures">
              <i className="fas fa-rocket"></i>
              <p>No ventures found</p>
            </div>
          )}
        </div>
      )}

      {/* Add New Venture Button */}
      <div className="add-venture-section">
        <button className="btn btn-primary btn-large" onClick={() => setShowCreateForm(true)}>
          <i className="fas fa-plus"></i> Start New Venture
        </button>
      </div>
    </div>
  );
};

export default AdminVentures;