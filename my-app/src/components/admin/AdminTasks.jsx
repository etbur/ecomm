import React, { useState } from 'react';

const AdminTasks = () => {
  const [filter, setFilter] = useState('all');

  const tasks = [
    {
      id: 1,
      title: 'Complete Profile Setup',
      description: 'Fill out all profile information',
      type: 'profile',
      status: 'active',
      assignedUsers: 45,
      completionRate: 78,
      reward: '$0.50',
      createdDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Daily Login Streak',
      description: 'Log in for 7 consecutive days',
      type: 'streak',
      status: 'active',
      assignedUsers: 123,
      completionRate: 65,
      reward: '$1.00',
      createdDate: '2024-01-10'
    },
    {
      id: 3,
      title: 'Invite Friends',
      description: 'Invite 3 friends to join the platform',
      type: 'referral',
      status: 'completed',
      assignedUsers: 89,
      completionRate: 45,
      reward: '$2.00',
      createdDate: '2024-01-08'
    },
    {
      id: 4,
      title: 'Watch Tutorial Video',
      description: 'Complete the platform tutorial',
      type: 'tutorial',
      status: 'draft',
      assignedUsers: 0,
      completionRate: 0,
      reward: '$0.25',
      createdDate: '2024-01-20'
    }
  ];

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
        <button className="btn btn-primary">
          <i className="fas fa-plus"></i> Create Task
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {filteredTasks.map((task) => (
          <div key={task.id} className="task-card-admin">
            <div className="task-header-admin">
              <h3>{task.title}</h3>
              <span className={`status-badge status-${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>

            <p className="task-description-admin">{task.description}</p>

            <div className="task-stats">
              <div className="stat-item">
                <span className="stat-label">Assigned Users:</span>
                <span className="stat-value">{task.assignedUsers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completion Rate:</span>
                <span className="stat-value">{task.completionRate}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reward:</span>
                <span className="stat-value">{task.reward}</span>
              </div>
            </div>

            <div className="task-progress-admin">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${task.completionRate}%` }}
                ></div>
              </div>
              <span className="progress-text">{task.completionRate}% completed</span>
            </div>

            <div className="task-actions">
              <button className="action-btn edit">
                <i className="fas fa-edit"></i> Edit
              </button>
              <button className="action-btn view">
                <i className="fas fa-eye"></i> View
              </button>
              <button className="action-btn delete">
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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
            <h3>${tasks.reduce((sum, t) => sum + parseFloat(t.reward.replace('$', '')), 0).toFixed(2)}</h3>
            <p>Total Rewards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTasks;