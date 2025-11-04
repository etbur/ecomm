import React, { useState, useEffect } from 'react';

const AdminTasks = () => {
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'profile',
    reward: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchTasks();
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
        status: 'draft'
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

  return (
    <div className="admin-tasks">
      <div className="page-header">
        <h1>Task Management</h1>
        <p>Create and manage platform tasks</p>
      </div>

      {/* Controls */}
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

      {/* Tasks Grid */}
      {!loading && !error && (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <div key={task._id} className="task-card-admin">
              <div className="task-header-admin">
                <h3>{task.title}</h3>
                <span className={`status-badge status-${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>

              <p className="task-description-admin">{task.description}</p>

              <div className="task-meta">
                <div className="meta-item">
                  <i className="fas fa-tag"></i>
                  <span>{task.type}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-calendar"></i>
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="task-stats">
                <div className="stat-item">
                  <span className="stat-label">Assigned Users:</span>
                  <span className="stat-value">{task.assignedUsers || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Completion Rate:</span>
                  <span className="stat-value">{task.completionRate || 0}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Reward:</span>
                  <span className="stat-value">${task.reward}</span>
                </div>
              </div>

              <div className="task-progress-admin">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${task.completionRate || 0}%` }}
                  ></div>
                </div>
                <span className="progress-text">{task.completionRate || 0}% completed</span>
              </div>

              <div className="task-actions">
                <button className="action-btn view">
                  <i className="fas fa-eye"></i> View
                </button>
                <button className="action-btn edit">
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="no-tasks">
              <i className="fas fa-tasks"></i>
              <p>No tasks found</p>
            </div>
          )}
        </div>
      )}

      {/* Task Statistics */}
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
    </div>
  );
};

export default AdminTasks;