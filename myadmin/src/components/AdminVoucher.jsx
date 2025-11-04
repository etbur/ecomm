import React, { useState, useEffect } from 'react';
import './AdminVoucher.css';

const AdminVoucher = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [voucherAmount, setVoucherAmount] = useState('');
  const [voucherType, setVoucherType] = useState('task_activation');
  const [generatedVouchers, setGeneratedVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchGeneratedVouchers();
  }, []);

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

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const fetchGeneratedVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/vouchers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vouchers');
      }

      const data = await response.json();
      setGeneratedVouchers(data.vouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setError('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoucher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const voucherData = {
        userId: selectedUser,
        amount: parseFloat(voucherAmount),
        type: voucherType,
        generatedBy: 'admin'
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/vouchers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(voucherData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate voucher');
      }

      const data = await response.json();
      setGeneratedVouchers([data.voucher, ...generatedVouchers]);
      setShowGenerateForm(false);
      setSelectedUser('');
      setVoucherAmount('');
      setVoucherType('task_activation');

      // Show success message with voucher code
      alert(`Voucher generated successfully!\nCode: ${data.voucher.code}\nAmount: $${data.voucher.amount}\nUser: ${data.voucher.userId?.username || 'Unknown'}\nPlease share this code with the user.`);
    } catch (error) {
      console.error('Error generating voucher:', error);
      setError('Failed to generate voucher');
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!window.confirm('Are you sure you want to delete this voucher?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/vouchers/${voucherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete voucher');
      }

      setGeneratedVouchers(generatedVouchers.filter(voucher => voucher._id !== voucherId));
    } catch (error) {
      console.error('Error deleting voucher:', error);
      setError('Failed to delete voucher');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'used': return 'secondary';
      case 'expired': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'task_activation': return 'Task Activation';
      case 'reward': return 'Reward';
      case 'bonus': return 'Bonus';
      default: return type;
    }
  };

  return (
    <div className="admin-voucher">
      <div className="page-header">
        <h1>Voucher Management</h1>
        <p>Generate and manage vouchers for users to activate tasks</p>
      </div>

      {/* Voucher Stats */}
      <div className="voucher-stats">
        <div className="stat-card">
          <h3>{generatedVouchers.length}</h3>
          <p>Total Vouchers</p>
        </div>
        <div className="stat-card">
          <h3>{generatedVouchers.filter(v => v.status === 'active').length}</h3>
          <p>Active Vouchers</p>
        </div>
        <div className="stat-card">
          <h3>{generatedVouchers.filter(v => v.status === 'used').length}</h3>
          <p>Used Vouchers</p>
        </div>
        <div className="stat-card">
          <h3>${generatedVouchers.reduce((sum, v) => sum + (v.status === 'active' ? v.amount : 0), 0).toLocaleString()}</h3>
          <p>Total Value</p>
        </div>
      </div>

      {/* Generate Voucher Form */}
      {showGenerateForm && (
        <div className="modal-overlay" onClick={() => setShowGenerateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate New Voucher</h3>
              <button className="close-btn" onClick={() => setShowGenerateForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleGenerateVoucher}>
              <div className="form-group">
                <label>Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Voucher Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(e.target.value)}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                  >
                    <option value="task_activation">Task Activation</option>
                    <option value="reward">Reward</option>
                    <option value="bonus">Bonus</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Voucher
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
          <p>Loading vouchers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchGeneratedVouchers} className="btn btn-primary">
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      )}

      {/* Vouchers Table */}
      {!loading && !error && (
        <div className="vouchers-table-container">
          {generatedVouchers.length > 0 ? (
            <table className="vouchers-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Code</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Generated</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {generatedVouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td className="user-cell">
                      <div className="user-info">
                        <span className="username">{voucher.userId?.username || 'Unknown'}</span>
                        <span className="email">{voucher.userId?.email || ''}</span>
                      </div>
                    </td>
                    <td className="code-cell">
                      <span className="voucher-code">{voucher.code}</span>
                    </td>
                    <td className="amount-cell">${voucher.amount.toFixed(2)}</td>
                    <td className="type-cell">{getTypeLabel(voucher.type)}</td>
                    <td className="status-cell">
                      <span className={`status-badge status-${getStatusColor(voucher.status)}`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(voucher.createdAt).toLocaleDateString()}</td>
                    <td className="date-cell">{new Date(voucher.expiresAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn copy"
                        onClick={() => navigator.clipboard.writeText(voucher.code)}
                        title="Copy Code"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                      {voucher.status === 'active' && (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteVoucher(voucher._id)}
                          title="Delete Voucher"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-voucher">
              <i className="fas fa-ticket-alt"></i>
              <p>No vouchers generated yet</p>
            </div>
          )}
        </div>
      )}

      {/* Generate New Voucher Button */}
      <div className="generate-voucher-section">
        <button className="btn btn-primary btn-large" onClick={() => setShowGenerateForm(true)}>
          <i className="fas fa-plus"></i> Generate New Voucher
        </button>
      </div>
    </div>
  );
};

export default AdminVoucher;