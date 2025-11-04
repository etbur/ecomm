import React, { useState, useEffect } from 'react';

const AdminUserTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    userId: '',
    taskType: '',
    status: ''
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${apiUrl}/api/admin/user-tasks?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user tasks');
      }

      const data = await response.json();
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      setError('Failed to load user tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const getTaskTypeColor = (taskType) => {
    switch (taskType) {
      case 'rating': return 'primary';
      case 'session_task': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="admin-user-tasks">
      <div className="page-header">
        <h1>User Task Completions</h1>
        <p>View all task completions by users</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>User ID:</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Filter by user ID"
            />
          </div>
          <div className="filter-group">
            <label>Task Type:</label>
            <select
              value={filters.taskType}
              onChange={(e) => handleFilterChange('taskType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="rating">Rating</option>
              <option value="session_task">Session Task</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Per Page:</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading user tasks...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchTasks} className="btn btn-primary">
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      )}

      {/* Tasks Table */}
      {!loading && !error && (
        <>
          <div className="table-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Product</th>
                  <th>Task Type</th>
                  <th>Reward</th>
                  <th>Profit</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Lucky Order</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="user-info">
                        <div className="username">{task.userId?.username}</div>
                        <div className="email">{task.userId?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="product-info">
                        <div className="product-name">{task.productId?.name}</div>
                        <div className="product-price">${task.productPrice?.toFixed(2)}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${getTaskTypeColor(task.taskType)}`}>
                        {task.taskType === 'rating' ? 'Rating' : 'Session Task'}
                      </span>
                    </td>
                    <td>${task.reward?.toFixed(2)}</td>
                    <td>${task.profit?.toFixed(2)}</td>
                    <td>${task.commission?.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {task.isLuckyOrder ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-secondary">No</span>
                      )}
                    </td>
                    <td>{formatDate(task.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tasks.length === 0 && (
              <div className="no-data">
                <i className="fas fa-tasks"></i>
                <p>No user tasks found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>

              <span className="page-info">
                Page {pagination.page} of {pagination.pages}
                ({pagination.total} total tasks)
              </span>

              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* Statistics */}
      {!loading && !error && (
        <div className="task-statistics">
          <h2>User Task Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{tasks.filter(t => t.status === 'completed').length}</h3>
              <p>Completed Tasks</p>
            </div>
            <div className="stat-card">
              <h3>{tasks.filter(t => t.isLuckyOrder).length}</h3>
              <p>Lucky Orders</p>
            </div>
            <div className="stat-card">
              <h3>${tasks.reduce((sum, t) => sum + (t.reward || 0), 0).toFixed(2)}</h3>
              <p>Total Rewards</p>
            </div>
            <div className="stat-card">
              <h3>${tasks.reduce((sum, t) => sum + (t.profit || 0), 0).toFixed(2)}</h3>
              <p>Total Profits</p>
            </div>
            <div className="stat-card">
              <h3>${tasks.reduce((sum, t) => sum + (t.commission || 0), 0).toFixed(2)}</h3>
              <p>Total Commissions</p>
            </div>
            <div className="stat-card">
              <h3>{new Set(tasks.map(t => t.userId?._id)).size}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTasks;