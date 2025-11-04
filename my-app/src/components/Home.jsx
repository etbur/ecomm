// Home.jsx - Parent-Child Daily Task Reward System
import React, { useState, useEffect } from 'react';
import './Home.css';
import { productsApi, userApi, sessionApi, relationshipApi, ratingsApi, handleApiError } from '../services/api';

const Home = () => {
  // State management
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRedeem, setShowRedeem] = useState(false);
  const [balance, setBalance] = useState(25.00);
  const [user, setUser] = useState(null);
  const [userRelationships, setUserRelationships] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showParentChildModal, setShowParentChildModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [parentUserId, setParentUserId] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [showLuckyOrderModal, setShowLuckyOrderModal] = useState(false);
  const [luckyOrderCommission, setLuckyOrderCommission] = useState(0);
  const [luckyOrderDeposit, setLuckyOrderDeposit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load user data and balance
      const userData = await userApi.getBalance();
      setUser(userData.user);
      setBalance(userData.balance);

      // Load user relationships
      try {
        const relationships = await relationshipApi.getRelationships();
        setUserRelationships(relationships);
      } catch (relError) {
        console.warn('Could not load relationships:', relError);
      }

      // Load active session
      try {
        const sessions = await sessionApi.getMySessions(1);
        setActiveSession(sessions.activeSession);
        if (sessions.summary) {
          setSessionStats(sessions.summary);
        }
      } catch (sessionError) {
        console.warn('Could not load sessions:', sessionError);
      }

      // Load products
      const productsData = await productsApi.getAll();
      setProducts(productsData.products);

    } catch (error) {
      console.error('Load initial data error:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Start Daily Session
  const handleStartSession = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const response = await sessionApi.start(parentUserId || undefined);
      
      setActiveSession(response.session);
      setSuccess('Daily session started successfully!');
      
      if (response.user) {
        setUser(prev => ({ ...prev, ...response.user }));
        setBalance(response.user.balance);
      }
      
    } catch (error) {
      console.error('Start session error:', error);
      setError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductClick = (product) => {
    // Always show rating interface when product is clicked
    setSelectedProduct(product);
    setSelectedRating(0);
    setShowRedeem(false);
    
    // Check if balance is sufficient for later use
    const isInsufficientBalance = balance < product.price;
    if (isInsufficientBalance) {
      setShowRedeem(true);
    }
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmitRating = async () => {
    if (!selectedProduct) {
      alert('Please select a product first!');
      return;
    }
    
    if (selectedRating !== 5) {
      alert('Please select 5 stars to complete the task!');
      return;
    }

    // Check balance before proceeding
    if (balance < selectedProduct.price) {
      setShowRedeem(true);
      alert(`Insufficient balance! You need $${(selectedProduct.price - balance).toFixed(2)} more to proceed.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      let response;
      
      // Try to use daily session if available, otherwise use simple rating
      if (activeSession) {
        // Use daily session system
        response = await sessionApi.completeTask(selectedProduct._id);
        setActiveSession(response.session);
      } else {
        // Use simple rating system (original approach) - only if no active session
        response = await ratingsApi.submit(selectedProduct._id, selectedRating);

        // Update balance from response
        setBalance(response.newBalance);

        // Reset state for simple mode
        setSelectedProduct(null);
        setShowRedeem(false);
        setSelectedRating(0);

        // Show simple success message
        let message = `Rating submitted! Task completed! Profit: $${response.profit.toFixed(2)}`;
        alert(message);

        // Reload data
        await loadInitialData();
        return;
      }
      
      // Update session from response (for session mode)
      setActiveSession(response.session);
      
      // Update user balance and stats
      if (response.user) {
        setUser(prev => ({ ...prev, ...response.user }));
        setBalance(response.user.balance);
      }
      
      // Reset state
      setSelectedProduct(null);
      setShowRedeem(false);
      setSelectedRating(0);
      
      // Show success message with details
      let message = `Rating submitted! Task completed! Profit: $${response.profit.toFixed(2)}`;
      if (response.session.luckyOrderTriggered) {
        message += `\n🎉 Lucky Order! Commission: $${response.session.luckyOrderCommission.toFixed(2)}`;
      }
      if (response.session.status === 'completed') {
        message += `\n🎊 Session completed! Total reward: $${response.session.rewardEarned.toFixed(2)}`;
      }
      
      alert(message);
      
      // Reload session data to get updated stats
      await loadInitialData();
      
    } catch (error) {
      console.error('Complete task error:', error);
      const errorMessage = handleApiError(error);

      // Handle insufficient balance error
      if (errorMessage.includes('Insufficient balance')) {
        setShowRedeem(true);
        alert(`Insufficient balance! Please recharge to complete this task.`);
      } else {
        // Show error as popup alert instead of banner
        alert(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecharge = () => {
    // Calculate commission and show confirmation modal
    const requiredAmount = selectedProduct.price - balance;
    const commission = requiredAmount * 0.0005; // 0.05% commission
    
    setLuckyOrderDeposit(requiredAmount);
    setLuckyOrderCommission(commission);
    setShowLuckyOrderModal(true);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount!');
      return;
    }

    // Allow deposits without requiring withdrawal address setup

    try {
      setSubmitting(true);
      setError('');

      const amount = parseFloat(depositAmount);
      const response = await userApi.deposit(amount, 'crypto', user?.withdrawalAddress || '', 'Deposit request from user');

      setShowDepositModal(false);
      setDepositAmount('');

      alert(`Deposit request submitted successfully! Amount: $${amount.toFixed(2)}\n\nYour deposit is now pending admin approval. You will be notified once it's processed.`);

    } catch (error) {
      console.error('Deposit error:', error);
      setError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateParentChild = async () => {
    if (!parentUserId) {
      alert('Please enter a Parent User ID!');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // For now, assume current user is the child
      const childUserId = user.id;
      await relationshipApi.createParentChild(parentUserId, childUserId);
      
      setShowParentChildModal(false);
      setParentUserId('');
      setSuccess('Parent-Child relationship created successfully!');
      
      // Reload relationships
      const relationships = await relationshipApi.getRelationships();
      setUserRelationships(relationships);
      
    } catch (error) {
      console.error('Create relationship error:', error);
      setError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLuckyOrderConfirm = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Deposit with lucky order commission flag - now creates pending deposit
      const response = await userApi.deposit(luckyOrderDeposit, 'crypto', user?.withdrawalAddress || '', 'Lucky Order Deposit');

      // Close modal and reset states
      setShowLuckyOrderModal(false);
      setShowDepositModal(false);
      setDepositAmount('');
      setLuckyOrderCommission(0);
      setLuckyOrderDeposit(0);

      alert(`🎉 Lucky Order Deposit Request Submitted!\nAmount: $${luckyOrderDeposit.toFixed(2)}\n\nYour deposit request is pending admin approval. Once approved, you'll receive the funds and can complete the task!`);

      // Note: No automatic rating submission since deposit is pending

    } catch (error) {
      console.error('Lucky order deposit error:', error);
      setError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedProduct(null);
    setShowRedeem(false);
    setError('');
  };

  
  const quickDepositAmounts = [10, 20, 50, 100];

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Parent-Child Daily Task System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Error Message */}
      {error && (
        <div className="error-banner">
          {error}
          <button className="error-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="success-banner">
          {success}
          <button className="success-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Header with Enhanced Stats */}
      <header className="app-header">
        <div className="header-content">
          <div className="balance-widget">
            <div className="balance-main">
              <div className="balance-label">Your Diposited Balance</div>
              <div className="balance-amount">${balance.toFixed(2)}</div>
              {userRelationships?.user && (
                <div className="user-type-badge">
                  {userRelationships.user.userType === 'parent' && '👑 Parent'}
                  {userRelationships.user.userType === 'child' && '👶 Child'}
                  {userRelationships.user.userType === 'regular' && '👤 User'}
                </div>
              )}
            </div>
            <div className="header-actions">
              <button
                className="deposit-btn"
                onClick={() => setShowDepositModal(true)}
                disabled={submitting}
              >
                <span className="btn-icon">+</span>
                Add Funds
              </button>
              {!activeSession && (
                <button
                  className="start-session-btn"
                  onClick={handleStartSession}
                  disabled={submitting}
                >
                  🚀 Start Daily Session
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Session Status Card */}
      {activeSession && (
        <div className="session-status-card">
          <div className="session-header">
            <h3>📊 Daily Session Active</h3>
            <span className={`session-status ${activeSession.status}`}>
              {activeSession.status}
            </span>
          </div>
          <div className="session-progress">
            <div className="progress-info">
              <span>Tasks: {activeSession.tasksCompleted}/{activeSession.totalTasks}</span>
              <span>Progress: {Math.round((activeSession.tasksCompleted / activeSession.totalTasks) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(activeSession.tasksCompleted / activeSession.totalTasks) * 100}%` }}
              ></div>
            </div>
          </div>
          {activeSession.isFirstSession && (
            <div className="first-session-badge">
              🎯 First Session Today!
            </div>
          )}
        </div>
      )}

      {/* Parent-Child Stats */}
      {userRelationships && (
        <div className="parent-child-stats">
          <div className="stats-grid">
            {userRelationships.parent && (
              <div className="stat-item">
                <div className="stat-label">Parent</div>
                <div className="stat-value">{userRelationships.parent.username}</div>
              </div>
            )}
            {userRelationships.children && userRelationships.children.length > 0 && (
              <div className="stat-item">
                <div className="stat-label">Children</div>
                <div className="stat-value">{userRelationships.children.length}</div>
              </div>
            )}
         
          </div>
          
          {userRelationships.user?.userType === 'regular' && (
            <button
              className="create-relationship-btn"
              onClick={() => setShowParentChildModal(true)}
            >
              👨‍👩‍👧‍👦 Create Parent-Child Relationship
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="banner-content">
            <div className="banner-text">
              <div className="banner-title"> Daily Task System</div>
              <div className="banner-subtitle">
                Complete 10 tasks to earn rewards
                {activeSession && ` • ${activeSession.tasksCompleted}/10 completed`}
              </div>
            </div>
            <div className="earnings-badge">
              $36.00 per daily + Lucky Order Bonuses!
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <section className="products-section">
          {products.length === 0 ? (
            <div className="no-products">
              <p>No products available at the moment.</p>
            </div>
          ) : (
            <>
              {!activeSession && (
                <div className="session-prompt">
                  <button
                    className="start-session-btn-small"
                    onClick={handleStartSession}
                    disabled={submitting}
                  >
                  </button>
                </div>
              )}
              <div className="products-grid">
                {products.map(product => (
                  <div
                    key={product._id}
                    className="product-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      <div className="product-category">{product.category}</div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">${product.price.toFixed(2)}</div>
                      <div className="earn-amount">Earn ${product.reward.toFixed(2)}</div>
                      <div className="profit-amount">Profit: ${(product.reward - product.price).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* 5-Star Rating Modal */}
      {selectedProduct && !showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-product-image" />
              <h2>{selectedProduct.name}</h2>
            </div>
            
            <div className="price-info">
              <div className="price-item">
                <span>Price:</span>
                <span className="price-amount">${selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="price-item">
                <span>Your Balance:</span>
                <span className="balance-amount">${balance.toFixed(2)}</span>
              </div>
              <div className="price-item">
                <span>Profit:</span>
                <span className="profit-amount">${(selectedProduct.reward - selectedProduct.price).toFixed(2)}</span>
              </div>
            </div>

            <div className="rating-section">
              <h3>Rate this product (5 stars to complete task)</h3>
              
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star-btn ${star <= selectedRating ? 'active' : ''}`}
                    onClick={() => handleStarClick(star)}
                    disabled={submitting}
                  >
                    {star <= selectedRating ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <p className="rating-instruction">
                Select 5 stars to complete the task and earn ${(selectedProduct.reward - selectedProduct.price).toFixed(2)} profit!
              </p>

              <button
                className={`submit-btn ${selectedRating === 5 ? 'active' : ''}`}
                onClick={handleSubmitRating}
                disabled={selectedRating !== 5 || submitting}
              >
                {submitting ? 'Processing...' : 'Submit 5-Star Rating & Complete Task'}
              </button>
            </div>

            <button className="back-btn" onClick={handleBackToDashboard}>
              Back to Products
            </button>
          </div>
        </div>
      )}

      {/* Insufficient Balance Modal - Rating Interface Active */}
      {selectedProduct && showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-product-image" />
              <h2>{selectedProduct.name}</h2>
            </div>
            
            <div className="price-info">
              <div className="price-item">
                <span>Price:</span>
                <span className="price-amount">${selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="price-item">
                <span>Your Balance:</span>
                <span className="balance-amount">${balance.toFixed(2)}</span>
              </div>
              <div className="price-item">
                <span>Need:</span>
                <span className="required-amount">${(selectedProduct.price - balance).toFixed(2)}</span>
              </div>
            </div>

            <div className="lucky-order-banner">
              <div className="lucky-title">⚡ Lucky Order Available!</div>
              <div className="lucky-text">
                Select 5 stars and recharge to complete this task!
                Earn ${(selectedProduct.reward - selectedProduct.price).toFixed(2)} profit.
              </div>
            </div>

            <div className="rating-section">
              <h3>Rate this product (5 stars to complete task)</h3>
              
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star-btn ${star <= selectedRating ? 'active' : ''}`}
                    onClick={() => handleStarClick(star)}
                    disabled={submitting}
                  >
                    {star <= selectedRating ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <p className="rating-instruction">
                Select 5 stars and recharge to complete the task!
              </p>

              <button
                className="submit-btn disabled"
                disabled
              >
                Submit 5-Star Rating & Complete Task
              </button>
            </div>

            <button
              className="recharge-btn"
              onClick={handleRecharge}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : `Add $${(selectedProduct.price - balance).toFixed(2)} to Continue`}
            </button>

            <button className="back-btn" onClick={handleBackToDashboard}>
              Back to Products
            </button>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Deposit Funds</h2>
            </div>

            <div className="current-balance">
              Current Balance: <span>${balance.toFixed(2)}</span>
            </div>

            {/* TRC20 Address Display */}
            {user?.withdrawalAddress && (
              <div className="trc20-address-section">
                <div className="address-display">
                  <label>Your TRC20 Address to Pay:</label>
                  <div className="address-box">
                    <span className="address-text">{user.withdrawalAddress}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(user.withdrawalAddress);
                        alert('Address copied to clipboard!');
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleDeposit} className="deposit-form">
             
              <div className="form-group">
                <label>Your TRC20 Address (for receiving funds)</label>
                <input
                  type="text"
                  value={user?.withdrawalAddress || ''}
                  placeholder="Enter your TRC20 wallet address"
                  disabled
                  readOnly
                />
                <small className="form-hint">
                  This is your receiving address. Send funds to this TRC20 address to deposit.
                </small>
              </div>

              <div className="form-group">
                <label>Amount to Deposit ($)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="quick-deposit">
                <label>Quick Amounts:</label>
                <div className="quick-buttons">
                  {quickDepositAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      className="quick-btn"
                      onClick={() => setDepositAmount(amount.toString())}
                      disabled={submitting}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="confirm-deposit-btn"
                disabled={submitting || !depositAmount || !user?.withdrawalAddress}
              >
                {submitting ? 'Processing...' : 'Submit Deposit Request'}
              </button>
            </form>

            <button
              className="back-btn"
              onClick={() => setShowDepositModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lucky Order Confirmation Modal */}
      {showLuckyOrderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🍀 Lucky Order Confirmation</h2>
            </div>

            <div className="lucky-order-confirmation">
              <div className="confirmation-header">
                <div className="lucky-icon">🍀</div>
                <h3>Activate Lucky Order Bonus</h3>
                <p>Complete this task with lucky order commission!</p>
              </div>

              <div className="calculation-breakdown">
                <div className="calc-item">
                  <span>Product:</span>
                  <span className="product-name">{selectedProduct?.name}</span>
                </div>
                <div className="calc-item">
                  <span>Required Deposit:</span>
                  <span className="amount">${luckyOrderDeposit.toFixed(2)}</span>
                </div>
                <div className="calc-item highlight">
                  <span>Lucky Order Commission (0.05%):</span>
                  <span className="commission">+${luckyOrderCommission.toFixed(2)}</span>
                </div>
                <div className="calc-item total">
                  <span>Total You'll Receive:</span>
                  <span className="total-amount">${(luckyOrderDeposit + luckyOrderCommission).toFixed(2)}</span>
                </div>
                <div className="calc-item">
                  <span>Task Profit:</span>
                  <span className="profit">${((selectedProduct?.reward || 0) - (selectedProduct?.price || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="benefits-list">
                <h4>Benefits of Lucky Order:</h4>
                <ul>
                  <li>✅ Complete the task and earn profit</li>
                  <li>💰 Get bonus commission on your deposit</li>
                  <li>🎯 Build towards daily session completion</li>
                  <li>🚀 Contribute to your earning goals</li>
                </ul>
              </div>

              <div className="confirmation-actions">
                <button
                  className="confirm-lucky-btn"
                  onClick={handleLuckyOrderConfirm}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : `Activate Lucky Order (+$${luckyOrderCommission.toFixed(2)})`}
                </button>
                <button
                  className="cancel-lucky-btn"
                  onClick={() => {
                    setShowLuckyOrderModal(false);
                    setLuckyOrderCommission(0);
                    setLuckyOrderDeposit(0);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parent-Child Relationship Modal */}
      {showParentChildModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Parent-Child Relationship</h2>
            </div>

            <div className="relationship-info">
              <p>Enter the Parent User ID to create a relationship:</p>
              <ul>
                <li>Child users earn $20 when parent completes sessions</li>
                <li>Parent users can track their children's progress</li>
                <li>Lucky order commissions apply to both accounts</li>
              </ul>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateParentChild(); }} className="relationship-form">
              <div className="form-group">
                <label>Parent User ID</label>
                <input
                  type="text"
                  value={parentUserId}
                  onChange={(e) => setParentUserId(e.target.value)}
                  placeholder="Enter parent user ID"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="create-relationship-btn"
                disabled={submitting || !parentUserId}
              >
                {submitting ? 'Creating...' : 'Create Relationship'}
              </button>
            </form>

            <button
              className="back-btn"
              onClick={() => setShowParentChildModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
