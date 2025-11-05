import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDeposit = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://shophub-w7f4.onrender.com';
      const response = await axios.get(`${apiUrl}/api/admin/deposits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeposits(response.data.deposits || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (depositId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://shophub-w7f4.onrender.com';
      await axios.put(`${apiUrl}/api/admin/deposits/${depositId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setDeposits(prevDeposits =>
        prevDeposits.map(d =>
          d._id === depositId ? { ...d, status: 'approved', processedAt: new Date() } : d
        )
      );
      alert('Deposit approved successfully');
    } catch (error) {
      console.error('Error approving deposit:', error);
      alert('Error approving deposit');
    }
  };

  const handleRejectDeposit = async (depositId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://shophub-w7f4.onrender.com';
      await axios.put(`${apiUrl}/api/admin/deposits/${depositId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setDeposits(prevDeposits =>
        prevDeposits.map(d =>
          d._id === depositId ? { ...d, status: 'rejected', processedAt: new Date() } : d
        )
      );
      alert('Deposit rejected');
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      alert('Error rejecting deposit');
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    if (filter === 'all') return true;
    return deposit.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const totalDeposited = deposits
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="admin-deposit">
      <div className="page-header">
        <h1>Deposit Management</h1>
        <p>Review and manage user deposit requests</p>
      </div>

      {/* Deposit Stats */}
      <div className="deposit-stats">
        <div className="stat-card">
          <h3>${totalDeposited.toFixed(2)}</h3>
          <p>Total Deposited</p>
        </div>
        <div className="stat-card">
          <h3>{deposits.filter(d => d.status === 'approved').length}</h3>
          <p>Approved</p>
        </div>
        <div className="stat-card">
          <h3>{deposits.filter(d => d.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{deposits.filter(d => d.status === 'rejected').length}</h3>
          <p>Rejected</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Deposits
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

      {/* Deposits Table */}
      <div className="deposits-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading deposits...</p>
          </div>
        ) : (
          <table className="deposits-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Address</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.map((deposit) => (
                <tr key={deposit._id}>
                  <td>{deposit.userId?.username || `User ${deposit.userId?.slice(-4)}`}</td>
                  <td className="amount">${deposit.amount.toFixed(2)}</td>
                  <td>{deposit.method.replace('_', ' ').toUpperCase()}</td>
                  <td className="address-cell">{deposit.address}</td>
                  <td>
                    <span className={`status-badge status-${getStatusColor(deposit.status)}`}>
                      {deposit.status}
                    </span>
                  </td>
                  <td>{new Date(deposit.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => setSelectedDeposit(deposit)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            className="action-btn approve"
                            title="Approve Deposit"
                            onClick={() => handleApproveDeposit(deposit._id)}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="action-btn reject"
                            title="Reject Deposit"
                            onClick={() => handleRejectDeposit(deposit._id)}
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

        {!loading && filteredDeposits.length === 0 && (
          <div className="no-deposits">
            <i className="fas fa-money-bill-wave"></i>
            <p>No deposits found</p>
          </div>
        )}
      </div>

      {/* Deposit Details Modal */}
      {selectedDeposit && (
        <div className="modal-overlay" onClick={() => setSelectedDeposit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deposit Details</h3>
              <button className="close-btn" onClick={() => setSelectedDeposit(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="deposit-details">
                <div className="detail-row">
                  <span className="label">User:</span>
                  <span className="value">{selectedDeposit.userId?.username || `User ${selectedDeposit.userId?.slice(-4)}`}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">${selectedDeposit.amount.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fee:</span>
                  <span className="value">${selectedDeposit.fee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Method:</span>
                  <span className="value">{selectedDeposit.method.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value address">{selectedDeposit.address}</span>
                </div>
                {selectedDeposit.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{selectedDeposit.notes}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge status-${getStatusColor(selectedDeposit.status)}`}>
                    {selectedDeposit.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Requested:</span>
                  <span className="value">{new Date(selectedDeposit.createdAt).toLocaleString()}</span>
                </div>
                {selectedDeposit.processedAt && (
                  <div className="detail-row">
                    <span className="label">Processed:</span>
                    <span className="value">{new Date(selectedDeposit.processedAt).toLocaleString()}</span>
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

export default AdminDeposit;