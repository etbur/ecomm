import React, { useState } from 'react';
import axios from 'axios';

const Investment = () => {
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [dailyProfit, setDailyProfit] = useState(30.00);
  const [monthlyProfit, setMonthlyProfit] = useState(900.00);
  const [totalReturn, setTotalReturn] = useState(2700.00);

  // Investment modal states
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentForm, setInvestmentForm] = useState({
    token: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSliderChange = (e) => {
    const amount = parseInt(e.target.value);
    setInvestmentAmount(amount);

    // Calculate profits based on Pro plan (3% daily)
    const daily = amount * 0.03;
    const monthly = daily * 30;
    const total = daily * 90;

    setDailyProfit(daily);
    setMonthlyProfit(monthly);
    setTotalReturn(total);
  };

  const handleInvestNow = (plan) => {
    setSelectedPlan(plan);
    setShowInvestmentModal(true);
  };

  const handleCopyAddress = () => {
    const trcAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // Example TRC20 address
    navigator.clipboard.writeText(trcAddress);
    alert('TRC20 address copied to clipboard!');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const investmentData = {
        userId,
        plan: selectedPlan,
        token: investmentForm.token,
        amount: parseFloat(investmentForm.amount),
        date: investmentForm.date,
        status: 'pending' // Requires admin authorization
      };

      await axios.post('https://shophub-w7f4.onrender.com/api/investments', investmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowInvestmentModal(false);
      setShowSuccessModal(true);
      setInvestmentForm({
        token: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Investment submission error:', error);
      alert('Error submitting investment. Please try again.');
    }
  };

  return (
    <section id="investment" className="page">
      <div className="container">
        <h2 className="page-title">Smart Investment Plans</h2>
        <p className="page-subtitle">Choose the plan that fits your investment goals</p>

        <div className="investment-plans">
          <div className="plan-card">
            <h3>Starter Plan</h3>
            <div className="plan-price">$100</div>
            <ul className="plan-features">
              <li>Daily Returns: 1.5%</li>
              <li>Contract Period: 30 Days</li>
              <li>Total Return: 45%</li>
              <li>Principal Return</li>
              <li>24/7 Support</li>
            </ul>
            <button className="btn" onClick={() => handleInvestNow('Starter Plan')}>Invest Now</button>
          </div>

          <div className="plan-card featured">
            <h3>Advanced Plan</h3>
            <div className="plan-price">$500</div>
            <ul className="plan-features">
              <li>Daily Returns: 2.2%</li>
              <li>Contract Period: 60 Days</li>
              <li>Total Return: 132%</li>
              <li>Principal Return</li>
              <li>Priority Support</li>
              <li>Bonus: 5%</li>
            </ul>
            <button className="btn" onClick={() => handleInvestNow('Advanced Plan')}>Invest Now</button>
          </div>

          <div className="plan-card">
            <h3>Pro Plan</h3>
            <div className="plan-price">$1,000</div>
            <ul className="plan-features">
              <li>Daily Returns: 3.0%</li>
              <li>Contract Period: 90 Days</li>
              <li>Total Return: 270%</li>
              <li>Principal Return</li>
              <li>VIP Support</li>
              <li>Bonus: 10%</li>
              <li>Personal Manager</li>
            </ul>
            <button className="btn" onClick={() => handleInvestNow('Pro Plan')}>Invest Now</button>
          </div>
        </div>

        <div style={{ marginTop: '50px', textAlign: 'center' }}>
          <h3>Investment Calculator</h3>
          <div className="form-group" style={{ maxWidth: '400px', margin: '20px auto' }}>
            <label htmlFor="investment-amount">Investment Amount ($)</label>
            <input
              type="range"
              id="investment-amount"
              className="hashrate-slider"
              min="100"
              max="5000"
              value={investmentAmount}
              onChange={handleSliderChange}
            />
            <div className="hashrate-value" id="investment-display">${investmentAmount}</div>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '10px', maxWidth: '500px', margin: '0 auto' }}>
            <div className="stat-item">
              <span>Estimated Daily Profit:</span>
              <span className="stat-value" id="daily-profit">${dailyProfit.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span>Estimated Monthly Profit:</span>
              <span className="stat-value" id="monthly-profit">${monthlyProfit.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span>Total Return (90 days):</span>
              <span className="stat-value" id="total-return">${totalReturn.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Investment Modal */}
        {showInvestmentModal && (
          <div className="modal-overlay" onClick={() => setShowInvestmentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Invest in {selectedPlan}</h3>
                <button className="close-btn" onClick={() => setShowInvestmentModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--card-bg)', borderRadius: '10px' }}>
                  <h4>TRC20 Token Address</h4>
                  <p style={{ wordBreak: 'break-all', margin: '10px 0', fontFamily: 'monospace' }}>
                    TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
                  </p>
                  <button className="btn" onClick={handleCopyAddress} style={{ width: '100%' }}>
                    Copy Address
                  </button>
                </div>

                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="token">Token (TRC20)</label>
                    <input
                      type="text"
                      id="token"
                      value={investmentForm.token}
                      onChange={(e) => setInvestmentForm({...investmentForm, token: e.target.value})}
                      placeholder="Enter your TRC20 token"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="amount">Investment Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      value={investmentForm.amount}
                      onChange={(e) => setInvestmentForm({...investmentForm, amount: e.target.value})}
                      placeholder="Enter investment amount"
                      className="form-control"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      id="date"
                      value={investmentForm.date}
                      onChange={(e) => setInvestmentForm({...investmentForm, date: e.target.value})}
                      className="form-control"
                      required
                    />
                  </div>

                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px' }}>
                    Submit Investment
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Investment Submitted!</h3>
                <button className="close-btn" onClick={() => setShowSuccessModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                  ✅ Your investment has been submitted successfully!
                </p>
                <p style={{ textAlign: 'center', color: '#b0b0b0' }}>
                  Your investment will be processed after admin authorization.
                  You will see the balance update in your Mine page once approved.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Investment;