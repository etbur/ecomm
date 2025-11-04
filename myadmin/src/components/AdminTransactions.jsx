import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminTransactions = () => {
  const [filter, setFilter] = useState('all');
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';

        // Fetch investments
        const investmentsResponse = await axios.get(`${apiUrl}/api/admin/investments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvestments(investmentsResponse.data.investments);

        // Fetch all user transactions
        const usersResponse = await axios.get(`${apiUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Collect all transactions from all users
        const allUserTransactions = [];
        for (const user of usersResponse.data.users) {
          if (user.transactions && user.transactions.length > 0) {
            allUserTransactions.push(...user.transactions.map(t => ({
              ...t,
              userId: user._id,
              username: user.username,
              email: user.email
            })));
          }
        }

        setTransactions(allUserTransactions);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveInvestment = async (investmentId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      await axios.put(`${apiUrl}/api/admin/investments/${investmentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setInvestments(prevInvestments =>
        prevInvestments.map(inv =>
          inv._id === investmentId ? { ...inv, status: 'approved' } : inv
        )
      );
    } catch (error) {
      console.error('Error approving investment:', error);
      alert('Error approving investment');
    }
  };

  const handleRejectInvestment = async (investmentId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://newwork-2.onrender.com';
      await axios.put(`${apiUrl}/api/admin/investments/${investmentId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setInvestments(prevInvestments =>
        prevInvestments.map(inv =>
          inv._id === investmentId ? { ...inv, status: 'rejected' } : inv
        )
      );
    } catch (error) {
      console.error('Error rejecting investment:', error);
      alert('Error rejecting investment');
    }
  };


  // Convert investments to transaction format for display
  const investmentTransactions = investments.map(inv => ({
    id: inv._id,
    user: `User ${inv.userId.slice(-4)}`, // Show last 4 chars of userId
    type: 'investment',
    amount: `$${inv.amount.toFixed(2)}`,
    status: inv.status,
    date: new Date(inv.createdAt).toLocaleString(),
    description: `${inv.plan} - Token: ${inv.token} - Amount: $${inv.amount} - Date: ${inv.date}`,
    fullData: inv // Store full investment data for actions
  }));

  // Convert user transactions to display format
  const userTransactionsFormatted = transactions.map(t => ({
    id: `${t.userId}_${t._id || Date.now()}`, // Create unique ID
    user: t.username || `User ${t.userId.slice(-4)}`,
    type: t.type,
    amount: `$${t.amount.toFixed ? t.amount.toFixed(2) : t.amount}`,
    status: t.status,
    date: new Date(t.createdAt || t.date).toLocaleString(),
    description: t.description,
    fullData: t
  }));

  const allTransactions = [...userTransactionsFormatted, ...investmentTransactions];

  const filteredTransactions = allTransactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task_reward': return 'fas fa-check-circle';
      case 'withdrawal': return 'fas fa-arrow-up';
      case 'referral_bonus': return 'fas fa-users';
      case 'purchase': return 'fas fa-shopping-cart';
      case 'investment': return 'fas fa-chart-line';
      default: return 'fas fa-dollar-sign';
    }
  };


  const totalVolume = allTransactions
    .filter(t => t.status === 'completed' || t.status === 'approved')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace('$', '')), 0);

  return (
    <div className="admin-transactions">
      <div className="page-header">
        <h1>Transaction Management</h1>
        <p>Monitor and manage all platform transactions</p>
      </div>

      {/* Transaction Stats */}
      <div className="transaction-stats">
        <div className="stat-card">
          <h3>${totalVolume.toFixed(2)}</h3>
          <p>Total Volume</p>
        </div>
        <div className="stat-card">
          <h3>{allTransactions.filter(t => t.status === 'completed' || t.status === 'approved').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{allTransactions.filter(t => t.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{allTransactions.filter(t => t.status === 'failed' || t.status === 'rejected').length}</h3>
          <p>Rejected</p>
        </div>
      </div>

      {/* Controls */}
      <div className="transactions-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Transactions
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
          >
            Failed
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
        <button className="btn btn-primary">
          <i className="fas fa-plus"></i> New Transaction
        </button>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.user}</td>
                <td>
                  <div className="transaction-type">
                    <i className={getTypeIcon(transaction.type)}></i>
                    <span>{transaction.type.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="amount">{transaction.amount}</td>
                <td>
                  <span className={`status-badge status-${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{transaction.date}</td>
                <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>{transaction.description}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view" title="View Details">
                      <i className="fas fa-eye"></i>
                    </button>
                    {transaction.status === 'pending' && transaction.type === 'investment' && (
                      <>
                        <button
                          className="action-btn approve"
                          title="Approve Investment"
                          onClick={() => handleApproveInvestment(transaction.id)}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="action-btn reject"
                          title="Reject Investment"
                          onClick={() => handleRejectInvestment(transaction.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                    {transaction.status === 'pending' && transaction.type !== 'investment' && (
                      <>
                        <button className="action-btn approve" title="Approve">
                          <i className="fas fa-check"></i>
                        </button>
                        <button className="action-btn reject" title="Reject">
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
      </div>

      {/* Transaction Chart Placeholder */}
      <div className="transaction-chart">
        <h2>Transaction Trends</h2>
        <div className="chart-placeholder">
          <i className="fas fa-chart-line"></i>
          <p>Transaction analytics chart would be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;