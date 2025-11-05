import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminWithdraw = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://shophub-w7f4.onrender.com';
      const response = await axios.get(`${apiUrl}/api/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(response.data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://shophub-w7f4.onrender.com';
      await axios.put(`${apiUrl}/api/admin/withdrawals/${withdrawalId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setWithdrawals(prevWithdrawals =>
        prevWithdrawals.map(w =>
          w._id === withdrawalId ? { ...w, status: 'approved', processedAt: new Date() } : w
        )
      );
      alert('Withdrawal approved successfully');
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Error approving withdrawal');
    }
  };

  const handleRejectWithdrawal = async (withdrawalId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://shophub-w7f4.onrender.com';
      await axios.put(`${apiUrl}/api/admin/withdrawals/${withdrawalId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setWithdrawals(prevWithdrawals =>
        prevWithdrawals.map(w =>
          w._id === withdrawalId ? { ...w, status: 'rejected', processedAt: new Date() } : w
        )
      );
      alert('Withdrawal rejected');
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Error rejecting withdrawal');
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filter === 'all') return true;
    return withdrawal.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="admin-withdraw">
      <div className="page-header">
        <h1>Withdrawal Management</h1>
        <p>Review and manage user withdrawal requests</p>
      </div>

      {/* Withdrawal Stats */}
      <div className="withdrawal-stats">
        <div className="stat-card">
          <h3>${totalWithdrawn.toFixed(2)}</h3>
          <p>Total Withdrawn</p>
        </div>
        <div className="stat-card">
          <h3>{withdrawals.filter(w => w.status === 'approved').length}</h3>
          <p>Approved</p>
        </div>
        <div className="stat-card">
          <h3>{withdrawals.filter(w => w.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{withdrawals.filter(w => w.status === 'rejected').length}</h3>
          <p>Rejected</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Withdrawals
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      {/* Withdrawals Table */}
      <div className="withdrawals-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading withdrawals...</p>
          </div>
        ) : (
          <table className="withdrawals-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id}>
                  <td>{withdrawal.userId?.username || `User ${withdrawal.userId?.slice(-4)}`}</td>
                  <td className="amount">${withdrawal.amount.toFixed(2)}</td>
                  <td>{withdrawal.method || 'Bank Transfer'}</td>
                  <td>
                    <span className={`status-badge status-${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td>{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {withdrawal.status === 'pending' && (
                        <>
                          <button
                            className="action-btn approve"
                            title="Approve Withdrawal"
                            onClick={() => handleApproveWithdrawal(withdrawal._id)}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="action-btn reject"
                            title="Reject Withdrawal"
                            onClick={() => handleRejectWithdrawal(withdrawal._id)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredWithdrawals.length === 0 && (
          <div className="no-withdrawals">
            <i className="fas fa-money-bill-wave"></i>
            <p>No withdrawals found</p>
          </div>
        )}
      </div>

      {/* Withdrawal Details Modal */}
      {selectedWithdrawal && (
        <div className="modal-overlay" onClick={() => setSelectedWithdrawal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Withdrawal Details</h3>
              <button className="close-btn" onClick={() => setSelectedWithdrawal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="withdrawal-details">
                <div className="detail-row">
                  <span className="label">User:</span>
                  <span className="value">{selectedWithdrawal.userId?.username || `User ${selectedWithdrawal.userId?.slice(-4)}`}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">${selectedWithdrawal.amount.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fee:</span>
                  <span className="value">${selectedWithdrawal.fee?.toFixed(2) || '2.00'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Method:</span>
                  <span className="value">{selectedWithdrawal.method}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value address">{selectedWithdrawal.address}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge status-${getStatusColor(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Requested:</span>
                  <span className="value">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</span>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div className="detail-row">
                    <span className="label">Processed:</span>
                    <span className="value">{new Date(selectedWithdrawal.processedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdraw;