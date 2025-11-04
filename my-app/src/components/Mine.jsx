import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Mine.css';
const Mine = () => {
  const [hashrate, setHashrate] = useState(50);
  const [isMining, setIsMining] = useState(false);
  const [currentHashrate, setCurrentHashrate] = useState('50 TH/s');
  const [dailyEarnings, setDailyEarnings] = useState('0.00045 BTC');
  const [monthlyEarnings, setMonthlyEarnings] = useState('0.0135 BTC');
  const [powerConsumption, setPowerConsumption] = useState('3500 W');

  // New states for user features
  const [userProfile, setUserProfile] = useState({ name: 'John Doe', email: 'john@example.com', bio: 'Crypto enthusiast' });
  const [balance, setBalance] = useState(0); // Will be set from approved investments
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [investmentBalance, setInvestmentBalance] = useState(0);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositHistory, setDepositHistory] = useState([
    { id: 1, amount: 200, date: '2023-10-05', method: 'Bank Transfer' },
    { id: 2, amount: 150, date: '2023-09-20', method: 'Credit Card' }
  ]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [showVouchersModal, setShowVouchersModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('TRC20');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [showWithdrawSetup, setShowWithdrawSetup] = useState(false);
  const [withdrawInfo, setWithdrawInfo] = useState(null);

  // Modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWithdrawHistoryModal, setShowWithdrawHistoryModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDepositHistoryModal, setShowDepositHistoryModal] = useState(false);

  // Load earnings and investment data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      // Load user info
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, using default user info');
          setUserInfo({
            username: 'Guest',
            email: 'guest@example.com'
          });
          setBalance(0);
          setInvestmentBalance(0);
          setTodayEarnings(0);
          setTotalEarnings(0);
          setUserVouchers([]);
          return;
        }

        try {
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User data loaded:', userResponse.data.user);
          console.log('Token used:', token);
          setUserInfo({
            username: userResponse.data.user.username,
            email: userResponse.data.user.email,
            referralCode: userResponse.data.user.referralCode
          });
        } catch (userError) {
          console.error('Error loading user data:', userError);
          // Try to get user info from localStorage as fallback
          const userId = localStorage.getItem('userId');
          const cryptoHubUser = localStorage.getItem('cryptoHubUser');
          if (cryptoHubUser) {
            const userData = JSON.parse(cryptoHubUser);
            console.log('Using fallback user data:', userData);
            setUserInfo({
              username: userData.username,
              email: userData.email,
              referralCode: userData.referralCode
            });
          }
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        // Fallback to default user info
        setUserInfo({
          username: 'Guest',
          email: 'guest@example.com'
        });
      }

      // Load investment balance and task completions
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, using default investment data');
          setBalance(0);
          setInvestmentBalance(0);
          setUserVouchers([]);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/investments/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvestmentBalance(response.data.balance || 0);
        setBalance(response.data.balance || 0); // Set balance to approved investment amount
        setUserVouchers(response.data.vouchers || []);
        console.log('Investment balance loaded:', response.data.balance);
        console.log('User vouchers loaded:', response.data.vouchers?.length || 0);

        // Check if user has withdrawal info set up
        if (response.data.withdrawInfo) {
          setWithdrawInfo(response.data.withdrawInfo);
        }

        // Load withdrawal info and balance from user data
        try {
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User data for withdrawal check:', userResponse.data.user);

          // Set balance from user data (this is the primary balance from user table)
          if (userResponse.data.user.balance !== undefined) {
            setBalance(userResponse.data.user.balance);
            console.log('Loaded balance from user table:', userResponse.data.user.balance);
            console.log('User info:', userResponse.data.user.username, userResponse.data.user.email);
          }

          if (userResponse.data.user.withdrawalMethod && userResponse.data.user.withdrawalAddress) {
            setWithdrawInfo({
              method: userResponse.data.user.withdrawalMethod,
              address: userResponse.data.user.withdrawalAddress
            });
            console.log('Loaded withdrawal info from user:', userResponse.data.user.withdrawalMethod, userResponse.data.user.withdrawalAddress);
          } else {
            console.log('No withdrawal info found in user data');
          }
        } catch (withdrawError) {
          console.warn('Could not load user data:', withdrawError);
        }
      } catch (error) {
        console.error('Error loading investment balance:', error);
        setBalance(0); // Default to 0 if no investments
        setInvestmentBalance(0);
        setUserVouchers([]);
      }

      // Load task completions and earnings
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, using default task earnings');
          setTodayEarnings(0);
          setTotalEarnings(0);
          return;
        }

        const taskResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/task-completions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodayEarnings(taskResponse.data.todayEarnings);
        setTotalEarnings(taskResponse.data.totalTaskEarnings);
        console.log('Task earnings loaded:', taskResponse.data);
      } catch (error) {
        console.error('Error loading task completions:', error);
        // Fallback to localStorage if API fails
        const userId = localStorage.getItem('userId') || 'guest';
        const todayEarned = parseFloat(localStorage.getItem(`todayEarnings_${userId}`) || '0');
        const totalEarned = parseFloat(localStorage.getItem(`totalEarnings_${userId}`) || '0');
        setTodayEarnings(todayEarned);
        setTotalEarnings(totalEarned);
      }
    };

    loadUserData();
  }, []);

  const fetchWithdrawHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawHistory(response.data.withdrawals || []);
      setShowWithdrawHistoryModal(true);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      alert('Failed to load withdrawal history');
    }
  };

  const handleHashrateChange = (e) => {
    const value = parseInt(e.target.value);
    setHashrate(value);
    setCurrentHashrate(`${value} TH/s`);
    setDailyEarnings(`${(0.000009 * value).toFixed(5)} BTC`);
    setMonthlyEarnings(`${(0.00027 * value).toFixed(5)} BTC`);
    setPowerConsumption(`${70 * value} W`);
  };

  const handleStartMining = () => {
    setIsMining(!isMining);
  };

  const handleSetupWithdrawInfo = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!withdrawMethod || !withdrawAddress || !withdrawPassword) {
      alert('Please fill in all required fields');
      return;
    }

    // Basic validation for different methods
    if (withdrawMethod !== 'Bank Transfer') {
      // For crypto addresses, basic length check
      if (withdrawAddress.length < 20) {
        alert('Please enter a valid wallet address');
        return;
      }
    } else {
      // For bank transfer, basic account number check
      if (withdrawAddress.length < 8) {
        alert('Please enter a valid account number');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Using API URL:', apiUrl);
      console.log('Making request to:', `${apiUrl}/api/user/setup-withdrawal`);

      const response = await axios.post(`${apiUrl}/api/user/setup-withdrawal`, {
        method: withdrawMethod,
        address: withdrawAddress,
        password: withdrawPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });

      console.log('Setup withdrawal response:', response.status, response.data);

      if (response.status === 200) {
        setWithdrawInfo({ method: withdrawMethod, address: withdrawAddress });
        setShowWithdrawSetup(false);
        setWithdrawMethod('TRC20');
        setWithdrawAddress('');
        setWithdrawPassword('');
        alert(withdrawInfo ? 'Withdrawal information updated successfully!' : 'Withdrawal information saved successfully!');
      } else {
        const message = response.data?.message || `Setup failed (status ${response.status})`;
        console.error('Setup withdrawal error:', message);
        throw new Error(message);
      }
    } catch (error) {
      console.error('Setup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save withdrawal information. Please check that all required fields (method, address, and password) are provided, and ensure the address format matches the selected withdrawal method. If the issue persists, contact support.';
      alert(errorMessage);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/withdrawals`, {
        amount: withdrawAmount,
        password: withdrawPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });

      alert('Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawPassword('');
      // Refresh balance - call loadUserData if it exists
      if (typeof loadUserData === 'function') {
        loadUserData();
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(error.response?.data?.message || 'Withdrawal failed');
    }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      const newDeposit = {
        id: depositHistory.length + 1,
        amount,
        date: new Date().toISOString().split('T')[0],
        method: 'Manual Deposit'
      };
      setDepositHistory([...depositHistory, newDeposit]);
      setBalance(balance + amount);
      setDepositAmount('');
    }
  };

  return (
    <section id="mine" className="page">
      <div className="container">
       
         {/* Action Buttons */}
        <div style={{ marginTop: '50px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => {
            if (!withdrawInfo) {
              setShowWithdrawSetup(true);
            } else {
              setShowWithdrawModal(true);
            }
          }}>Withdraw</button>
          {!withdrawInfo && (
            <button className="btn btn-secondary" onClick={() => setShowWithdrawSetup(true)}>
              Set Withdrawal Credentials
            </button>
          )}
          {withdrawInfo && (
            <button className="btn btn-outline" onClick={() => setShowWithdrawSetup(true)}>
              Update Withdrawal Credentials
            </button>
          )}
          <button className="btn" onClick={() => fetchWithdrawHistory()}>Withdraw History</button>
          <button className="btn" onClick={() => setShowDepositModal(true)}>Deposit</button>
          <button className="btn" onClick={() => setShowDepositHistoryModal(true)}>Deposit History</button>
          <button className="btn" onClick={() => setShowVouchersModal(true)}>My Vouchers ({userVouchers.length})</button>
        </div>
        
       

        {/* About Me Section */}
        <div style={{ marginTop: '50px' }}>
          <h3>My Account Information</h3>
          <div className="user-profile">
            <div className="profile-item">
              <span>Username:</span>
              <span>{userInfo.username || 'Guest'}</span>
            </div>
            <div className="profile-item">
              <span>Email:</span>
              <span>{userInfo.email || 'guest@example.com'}</span>
            </div>
            <div className="profile-item">
              <span>Account Balance:</span>
              <span>${(balance || 30).toFixed(2)}</span>
            </div>
            <div className="profile-item">
              <span>Today's BTC Earnings:</span>
              <span>{(todayEarnings || 0).toFixed(4)} BTC</span>
            </div>
            <div className="profile-item">
              <span>Total BTC Earnings:</span>
              <span>{(totalEarnings || 0).toFixed(4)} BTC</span>
            </div>
            <div className="profile-item">
              <span>Approved Investment Amount:</span>
              <span>${(investmentBalance || 0).toFixed(2)}</span>
            </div>
            <div className="profile-item">
              <span>Active Vouchers:</span>
              <span>{userVouchers.length} {userVouchers.length > 0 && `- ${userVouchers[0].code}`}</span>
            </div>
            <div className="profile-item">
              <span>Referral Code:</span>
              <span>{userInfo.referralCode || 'Not available'}</span>
            </div>
          </div>
        </div>

       

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Withdraw Funds</h3>
                <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="withdraw-amount">Amount ($)</label>
                  <input
                    type="number"
                    id="withdraw-amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="form-control"
                  />
                </div>
                <button className="btn" onClick={handleWithdraw} disabled={!withdrawAmount || parseFloat(withdrawAmount) > balance}>
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw History Modal */}
        {showWithdrawHistoryModal && (
          <div className="modal-overlay" onClick={() => setShowWithdrawHistoryModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Withdraw History</h3>
                <button className="close-btn" onClick={() => setShowWithdrawHistoryModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawHistory.map((item) => (
                        <tr key={item._id}>
                          <td>${item.amount.toFixed(2)}</td>
                          <td>{item.method}</td>
                          <td>
                            <span className={`status-badge status-${
                              item.status === 'approved' ? 'success' :
                              item.status === 'pending' ? 'warning' : 'danger'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {withdrawHistory.length === 0 && (
                    <div className="no-history">
                      <i className="fas fa-history"></i>
                      <p>No withdrawal history found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Deposit Funds</h3>
                <button className="close-btn" onClick={() => setShowDepositModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="deposit-amount">Amount ($)</label>
                  <input
                    type="number"
                    id="deposit-amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount to deposit"
                    className="form-control"
                  />
                </div>
                <button className="btn" onClick={handleDeposit} disabled={!depositAmount}>
                  Deposit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deposit History Modal */}
        {showDepositHistoryModal && (
          <div className="modal-overlay" onClick={() => setShowDepositHistoryModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Deposit History</h3>
                <button className="close-btn" onClick={() => setShowDepositHistoryModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depositHistory.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>${item.amount}</td>
                          <td>{item.date}</td>
                          <td>{item.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vouchers Modal */}
        {showVouchersModal && (
          <div className="modal-overlay" onClick={() => setShowVouchersModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>My Vouchers</h3>
                <button className="close-btn" onClick={() => setShowVouchersModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                {userVouchers.length === 0 ? (
                  <p>No active vouchers available.</p>
                ) : (
                  <div className="vouchers-list">
                    {userVouchers.map((voucher) => (
                      <div key={voucher._id} className="voucher-item">
                        <div className="voucher-header">
                          <h4>${voucher.amount.toFixed(2)}</h4>
                          <span className="voucher-type">{voucher.type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div className="voucher-details">
                          <p><strong>Code:</strong> <span className="voucher-code">{voucher.code}</span></p>
                          <p><strong>Expires:</strong> {new Date(voucher.expiresAt).toLocaleDateString()}</p>
                          <p><strong>Status:</strong> <span className="status-active">{voucher.status}</span></p>
                        </div>
                        <button
                          className="btn btn-small"
                          onClick={() => navigator.clipboard.writeText(voucher.code)}
                        >
                          Copy Code
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Setup Modal */}
        {showWithdrawSetup && (
          <div className="modal-overlay" onClick={() => setShowWithdrawSetup(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{withdrawInfo ? 'Update Withdrawal Information' : 'Set Up Withdrawal Information'}</h3>
                <button className="close-btn" onClick={() => setShowWithdrawSetup(false)}>&times;</button>
              </div>
              <form className="modal-body" onSubmit={handleSetupWithdrawInfo}>
                <div className="form-group">
                  <label>Withdrawal Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    required
                  >
                    <option value="TRC20">TRC20 (USDT)</option>
                    <option value="ERC20">ERC20 (USDT)</option>
                    <option value="BEP20">BEP20 (USDT)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Wallet Address / Account Number</label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder={withdrawMethod === 'Bank Transfer' ? 'Enter account number' : 'Enter wallet address'}
                    required
                  />
                  {withdrawInfo && (
                    <small className="current-info">Current: {withdrawInfo.address}</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawSetup(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Information
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Request Withdrawal</h3>
                <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>&times;</button>
              </div>
              <form className="modal-body" onSubmit={handleWithdraw}>
                <div className="withdraw-info">
                  <p><strong>Method:</strong> {withdrawInfo.method}</p>
                  <p><strong>Address:</strong> {withdrawInfo.address}</p>
                </div>
                <div className="form-group">
                  <label>Amount to Withdraw ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Minimum $10"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="withdraw-summary">
                  <p>Available Balance: ${balance.toFixed(2)}</p>
                  <p>Withdrawal Fee: $2.00</p>
                  <p>You will receive: ${(parseFloat(withdrawAmount || 0) - 2).toFixed(2)}</p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Request Withdrawal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Mine;

