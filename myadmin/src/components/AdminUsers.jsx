import React, { useState, useEffect } from 'react';
import './AdminUsers.css'; // Make sure to create this CSS file

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedUserReferrals, setSelectedUserReferrals] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [addUserLoading, setAddUserLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const handleSetWithdrawCredentials = async (userId) => {
    const method = prompt('Enter withdrawal method (TRC20, ERC20, BEP20, Bank Transfer):');
    if (!method) return;

    const address = prompt(`Enter ${method === 'Bank Transfer' ? 'account number' : 'wallet address'}:`);
    if (!address) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/set-withdrawal-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          method,
          address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to set withdrawal credentials');
      }

      alert('Withdrawal credentials set successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error setting withdrawal credentials:', error);
      alert('Error setting withdrawal credentials');
    }
  };

  const handleEditBalance = async (userId, currentBalance) => {
    const newBalance = prompt('Enter new balance amount:', currentBalance);
    if (newBalance === null) return; // User cancelled

    const balance = parseFloat(newBalance);
    if (isNaN(balance) || balance < 0) {
      alert('Please enter a valid positive number for balance');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/balance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          balance: balance
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update balance');
      }

      alert('Balance updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
      alert(`Error updating balance: ${error.message}`);
    }
  };

  const handleViewReferrals = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/user/referrals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }

      const data = await response.json();
      setSelectedUserReferrals(data.referrals);
      setSelectedUser(user);
      setShowReferralModal(true);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      alert('Error fetching referrals');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('All fields are required');
      return;
    }

    setAddUserLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/create-test-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data = await response.json();
      alert(`User created successfully! Referral code: ${data.user.referralCode}`);
      setNewUser({ username: '', email: '', password: '', confirmPassword: '' });
      setShowAddUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error.message}`);
    } finally {
      setAddUserLoading(false);
    }
  };

  const getStatusBadgeClass = (user) => {
    // You can modify this logic based on your user status property
    return user.isActive !== false ? 'status-active' : 'status-inactive';
  };

  const getRoleBadgeClass = (user) => {
    // You can modify this logic based on your user role property
    return user.role === 'admin' ? 'role-admin' : 'role-user';
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage and monitor all platform users</p>
      </div>

      {/* Search and Filters */}
      <div className="users-controls">
        <div className="search-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
          <i className="fas fa-plus"></i> Add User
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser} className="modal-body">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addUserLoading}
                >
                  {addUserLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content referral-modal">
            <div className="modal-header">
              <h3>Referrals for {selectedUser.username}</h3>
              <button
                className="close-btn"
                onClick={() => setShowReferralModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="referral-summary">
                <div className="summary-item">
                  <span className="label">Total Referrals:</span>
                  <span className="value">{selectedUserReferrals.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Referral Code:</span>
                  <span className="value">{selectedUser.referralCode || 'N/A'}</span>
                </div>
              </div>

              {selectedUserReferrals.length > 0 ? (
                <div className="referrals-table-container">
                  <table className="referrals-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Join Date</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserReferrals.map((referral) => (
                        <tr key={referral._id}>
                          <td>{referral.username}</td>
                          <td>{referral.email}</td>
                          <td>{new Date(referral.createdAt).toLocaleDateString()}</td>
                          <td>${(referral.balance || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-referrals">
                  <i className="fas fa-users"></i>
                  <p>No referrals found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Referral Code</th>
                <th>Balance</th>
                <th>Referrals</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="referral-code">{user.referralCode || 'N/A'}</span>
                  </td>
                  <td>${(user.balance || 0).toFixed(2)}</td>
                  <td>{user.referrals ? user.referrals.length : 0}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user)}`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => setSelectedUser(user)}
                      >
                        👁️
                      </button>
                      <button
                        className="action-btn referrals"
                        title="View Referrals"
                        onClick={() => handleViewReferrals(user)}
                      >
                        👥
                      </button>
                      <button
                        className="action-btn edit-balance"
                        title="Edit Balance"
                        onClick={() => handleEditBalance(user._id, user.balance)}
                      >
                        💵
                      </button>
                      <button
                        className="action-btn edit"
                        title="Set Withdrawal Credentials"
                        onClick={() => handleSetWithdrawCredentials(user._id)}
                      >
                        💰
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete User"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="no-users">
              <i className="fas fa-users"></i>
              <p>No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;