import React, { useState, useEffect } from 'react';

const AdminTasks = () => {
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'profile',
    reward: '',
    status: 'draft',
    assignedTo: null,
    taskCount: ''
  });
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    reward: '0.00'
  });
  const [productLoading, setProductLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [users, setUsers] = useState([]);
  const [showSetTaskForUserForm, setShowSetTaskForUserForm] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      setTasks([data.task, ...tasks]);
      setShowCreateForm(false);
      setNewTask({
        title: '',
        description: '',
        type: 'profile',
        reward: '',
        status: 'draft',
        assignedTo: null,
        taskCount: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'draft': return 'warning';
      default: return 'secondary';
    }
  };

  const handleProductFormChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      const response = await fetch(`${apiUrl}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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

      // Reset form and refresh products
      setProductForm({
        name: '',
        price: '',
        image: '',
        category: '',
        reward: '0.00'
      });
      setShowProductForm(false);
      fetchProducts();

    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error creating product: ${error.message}`);
    } finally {
      setProductLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      reward: product.reward.toString()
    });
    setShowEditProductForm(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name || !productForm.price || !productForm.image || !productForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    setProductLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      const response = await fetch(`${apiUrl}/api/products/${editingProduct._id}`, {
        method: 'PUT',
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
        throw new Error(errorData.message || 'Failed to update product');
      }

      alert('Product updated successfully!');

      // Reset form and refresh products
      setProductForm({
        name: '',
        price: '',
        image: '',
        category: '',
        reward: '36.00'
      });
      setShowEditProductForm(false);
      setEditingProduct(null);
      fetchProducts();

    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Error updating product: ${error.message}`);
    } finally {
      setProductLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Error deleting product: ${error.message}`);
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      alert(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      alert(`Error updating product status: ${error.message}`);
    }
  };

  const handleSetTaskForUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

      // Find the selected user
      const selectedUser = users.find(user => user._id === newTask.assignedTo);
      if (!selectedUser) {
        alert('Please select a valid user');
        return;
      }

      // Create a task with the daily quota
      const taskData = {
        title: `Daily Task Quota: ${newTask.taskCount} tasks per day`,
        description: `Complete ${newTask.taskCount} product rating tasks per day. This is your daily quota assigned by admin.`,
        type: 'daily_quota',
        reward: '0.00', // No individual reward, quota-based
        status: 'active',
        assignedTo: newTask.assignedTo,
        taskCount: newTask.taskCount
      };

      const response = await fetch(`${apiUrl}/api/admin/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to set daily task quota for user');
      }

      const data = await response.json();
      setTasks([data.task, ...tasks]);
      setShowSetTaskForUserForm(false);
      setNewTask({
        title: '',
        description: '',
        type: 'profile',
        reward: '',
        status: 'draft',
        assignedTo: null,
        taskCount: ''
      });
      alert(`Daily task quota of ${newTask.taskCount} tasks set for ${selectedUser.username} successfully!`);
    } catch (error) {
      console.error('Error setting task quota for user:', error);
      alert(`Error setting task quota for user: ${error.message}`);
    }
  };

  return (
    <div className="admin-tasks">
      <div className="page-header">
        <h1>Task & Product Management</h1>
        <p>Create and manage platform tasks and products</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks ({tasks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
      </div>

      {/* Task Controls */}
      {activeTab === 'tasks' && (
        <div className="tasks-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Tasks
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
              onClick={() => setFilter('draft')}
            >
              Draft
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            <i className="fas fa-plus"></i> Create Task
          </button>
        </div>
      )}

      {/* Product Controls */}
      {activeTab === 'products' && (
        <div className="tasks-controls">
          <div className="filter-buttons">
            <span className="filter-label">Product Management</span>
          </div>
          <div className="action-buttons">
            <button className="btn btn-success" onClick={() => setShowProductForm(true)}>
              <i className="fas fa-plus"></i> Add Product
            </button>
            <button className="btn btn-primary" onClick={() => setShowSetTaskForUserForm(true)}>
              <i className="fas fa-user-plus"></i> Set Task for User
            </button>
          </div>
        </div>
      )}

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="close-btn" onClick={() => setShowCreateForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                  placeholder="Enter task title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  required
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                  >
                    <option value="profile">Profile</option>
                    <option value="streak">Streak</option>
                    <option value="referral">Referral</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="social">Social</option>
                    <option value="survey">Survey</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reward ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTask.reward}
                    onChange={(e) => setNewTask({...newTask, reward: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Creation Form */}
      {showProductForm && (
        <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setShowProductForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
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
                <label>Image URL *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => handleProductFormChange('image', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
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
                  <label>Reward ($)</label>
                  <input
                    type="number"
                    value={productForm.reward}
                    onChange={(e) => handleProductFormChange('reward', e.target.value)}
                    placeholder="36.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={productLoading}>
                  {productLoading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Edit Form */}
      {showEditProductForm && editingProduct && (
        <div className="modal-overlay" onClick={() => setShowEditProductForm(false)}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="close-btn" onClick={() => setShowEditProductForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleUpdateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
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
                <label>Image URL *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => handleProductFormChange('image', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
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
                  <label>Reward ($)</label>
                  <input
                    type="number"
                    value={productForm.reward}
                    onChange={(e) => handleProductFormChange('reward', e.target.value)}
                    placeholder="36.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditProductForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={productLoading}>
                  {productLoading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Task for User Form */}
      {showSetTaskForUserForm && (
        <div className="modal-overlay" onClick={() => setShowSetTaskForUserForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set Daily Task Quota for User</h3>
              <button className="close-btn" onClick={() => setShowSetTaskForUserForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSetTaskForUser}>
              <div className="form-group">
                <label>Select User *</label>
                <select
                  value={newTask.assignedTo || ''}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Number of Tasks per Day *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newTask.taskCount || ''}
                  onChange={(e) => setNewTask({...newTask, taskCount: parseInt(e.target.value)})}
                  placeholder="e.g., 10"
                  required
                />
                <small className="form-help">Set the daily task quota for this user (1-50 tasks per day)</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSetTaskForUserForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Set Daily Task Quota
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
          <p>Loading tasks...</p>
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
      {activeTab === 'tasks' && !loading && !error && (
        <>
          {/* User Task Quotas Table */}
          <div className="table-container">
            <h3>User Task Quotas</h3>
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Daily Task Quota</th>
                  <th>Status</th>
                  <th>Assigned Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks
                  .filter(task => task.type === 'daily_quota' && task.assignedTo)
                  .map((task) => {
                    const assignedUser = users.find(user => user._id === task.assignedTo);
                    return (
                      <tr key={task._id}>
                        <td>
                          <div className="user-info">
                            <div className="username">{assignedUser?.username || 'Unknown User'}</div>
                            <div className="email">{assignedUser?.email || ''}</div>
                          </div>
                        </td>
                        <td>
                          <div className="quota-display">
                            <span className="quota-number">{task.taskCount}</span>
                            <span className="quota-label">tasks per day</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn edit" title="Edit Quota">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteTask(task._id)}
                              title="Remove Quota"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {filteredTasks.filter(task => task.type === 'daily_quota' && task.assignedTo).length === 0 && (
              <div className="no-data">
                <i className="fas fa-user-clock"></i>
                <p>No user task quotas assigned</p>
              </div>
            )}
          </div>

          {/* General Tasks Table */}
          <div className="table-container">
            <h3>General Tasks</h3>
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Reward</th>
                  <th>Assigned Users</th>
                  <th>Completion Rate</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks
                  .filter(task => task.type !== 'daily_quota')
                  .map((task) => (
                    <tr key={task._id}>
                      <td>
                        <div className="task-title-cell">
                          <strong>{task.title}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="task-description-cell">
                          {task.description.length > 50
                            ? `${task.description.substring(0, 50)}...`
                            : task.description
                          }
                        </div>
                      </td>
                      <td>
                        <span className="type-badge">{task.type}</span>
                      </td>
                      <td>${task.reward}</td>
                      <td>{task.assignedUsers || 0}</td>
                      <td>
                        <div className="completion-cell">
                          <span className="completion-rate">{task.completionRate || 0}%</span>
                          <div className="mini-progress-bar">
                            <div
                              className="mini-progress-fill"
                              style={{ width: `${task.completionRate || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" title="View Task">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="action-btn edit" title="Edit Task">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete Task"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {filteredTasks.filter(task => task.type !== 'daily_quota').length === 0 && (
              <div className="no-data">
                <i className="fas fa-tasks"></i>
                <p>No general tasks found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Products Table */}
      {activeTab === 'products' && !loading && !error && (
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="product-image-cell" >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-thumbnail-small"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="product-name-cell">
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td>${product.reward.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditProduct(product)}
                        title="Edit Product"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={`action-btn ${product.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleProductStatus(product._id, product.isActive)}
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas ${product.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteProduct(product._id)}
                        title="Delete Product"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="no-data">
              <i className="fas fa-box"></i>
              <p>No products found</p>
            </div>
          )}
        </div>
      )}

      {/* Task Statistics */}
      {activeTab === 'tasks' && (
        <div className="task-statistics">
          <h2>Task Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{tasks.filter(t => t.status === 'active').length}</h3>
              <p>Active Tasks</p>
            </div>
            <div className="stat-card">
              <h3>{tasks.filter(t => t.status === 'completed').length}</h3>
              <p>Completed Tasks</p>
            </div>
            <div className="stat-card">
              <h3>{tasks.reduce((sum, t) => sum + t.assignedUsers, 0)}</h3>
              <p>Total Assignments</p>
            </div>
            <div className="stat-card">
              <h3>${tasks.reduce((sum, t) => sum + parseFloat(t.reward || 0), 0).toFixed(2)}</h3>
              <p>Total Rewards</p>
            </div>
          </div>
        </div>
      )}

      {/* Product Statistics */}
      {activeTab === 'products' && (
        <div className="task-statistics">
          <h2>Product Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{products.filter(p => p.isActive).length}</h3>
              <p>Active Products</p>
            </div>
            <div className="stat-card">
              <h3>{products.filter(p => !p.isActive).length}</h3>
              <p>Inactive Products</p>
            </div>
            <div className="stat-card">
              <h3>{products.length}</h3>
              <p>Total Products</p>
            </div>
            <div className="stat-card">
              <h3>${products.reduce((sum, p) => sum + parseFloat(p.reward || 0), 0).toFixed(2)}</h3>
              <p>Total Rewards</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;