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
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    reward: '36.00'
  });
  const [productLoading, setProductLoading] = useState(false);

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

  const handleProductFormChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name || !productForm.price || !productForm.image || !productForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    setProductLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: productForm.name,
          price: parseFloat(productForm.price),
          image: productForm.image,
          category: productForm.category,
          reward: parseFloat(productForm.reward)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      const data = await response.json();
      alert('Product created successfully!');

      // Reset form
      setProductForm({
        name: '',
        price: '',
        image: '',
        category: '',
        reward: '36.00'
      });
      setShowProductForm(false);

    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error creating product: ${error.message}`);
    } finally {
      setProductLoading(false);
    }
  };

  return (
    <div className="admin-user-tasks">
      <div className="page-header">
        <h1>User Task Completions</h1>
        <p>View all task completions by users</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowProductForm(!showProductForm)}
        >
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>

      {/* Product Creation Form */}
      {showProductForm && (
        <div className="product-form-container">
          <div className="product-form-card">
            <div className="form-header">
              <h3>Add New Product</h3>
              <button
                className="close-btn"
                onClick={() => setShowProductForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-name">Product Name *</label>
                  <input
                    type="text"
                    id="product-name"
                    value={productForm.name}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="product-price">Price ($) *</label>
                  <input
                    type="number"
                    id="product-price"
                    value={productForm.price}
                    onChange={(e) => handleProductFormChange('price', e.target.value)}
                    placeholder="89.99"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="product-image">Image URL *</label>
                <input
                  type="url"
                  id="product-image"
                  value={productForm.image}
                  onChange={(e) => handleProductFormChange('image', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-category">Category *</label>
                  <select
                    id="product-category"
                    value={productForm.category}
                    onChange={(e) => handleProductFormChange('category', e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Sports">Sports</option>
                    <option value="Home">Home</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="product-reward">Reward ($)</label>
                  <input
                    type="number"
                    id="product-reward"
                    value={productForm.reward}
                    onChange={(e) => handleProductFormChange('reward', e.target.value)}
                    placeholder="36.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProductForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={productLoading}
                >
                  {productLoading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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