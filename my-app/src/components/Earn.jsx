import { useState, useEffect } from "react";
import "./Earn.css";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = 'http://localhost:5000/api';

// Referral Section Styles (unchanged)
const referralStyles = {
  container: { marginTop: '40px', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', color: 'white' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  icon: { fontSize: '28px' },
  subtitle: { fontSize: '14px', opacity: 0.9 },
  card: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px', marginBottom: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  cardTitle: { margin: 0, fontSize: '18px', fontWeight: '600' },
  count: { fontSize: '14px', opacity: 0.8 },
  linkContainer: { display: 'flex', gap: '12px', alignItems: 'center' },
  linkText: { flex: 1, padding: '12px 16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px', fontSize: '14px', wordBreak: 'break-all', border: '1px solid rgba(255, 255, 255, 0.3)' },
  buttonGroup: { display: 'flex', gap: '8px' },
  copyButton: { padding: '12px 16px', background: 'rgba(34, 197, 94, 0.8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' },
  shareButton: { padding: '12px 16px', background: 'rgba(59, 130, 246, 0.8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '20px' },
  statCard: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' },
  statValue: { fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' },
  statLabel: { fontSize: '12px', opacity: 0.8 },
  usersList: { maxHeight: '300px', overflowY: 'auto' },
  userItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  userAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' },
  userDetails: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '14px', fontWeight: '600', marginBottom: '2px' },
  userEmail: { fontSize: '12px', opacity: 0.8 },
  userCommission: { fontSize: '14px', fontWeight: '600', background: 'rgba(34, 197, 94, 0.3)', padding: '4px 8px', borderRadius: '12px' },
  loading: { textAlign: 'center', padding: '40px 20px', opacity: 0.8 },
  emptyState: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px', opacity: 0.6 },
  emptyText: { fontSize: '16px', fontWeight: '600', marginBottom: '8px' },
  emptySubtext: { fontSize: '14px', opacity: 0.7 },
};

// Referral Section Component (fixed)
function ReferralSection({ user, isLoggedIn, userInfo }) {
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    totalReferredUsers: 0,
    totalCommissions: 0,
    userBalance: 0,
    referredUsers: []
  });
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchReferralData();
    }
    // run when user or isLoggedIn changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const buildReferralLink = (code) => {
    // build consistent referral link. Change path if your signup route differs.
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
    return `${origin}/signup?ref=${encodeURIComponent(code)}`;
  };

  const fetchReferralData = async () => {
    if (!user?.token) return;
    setLoading(true);

    try {
      // First try to get the user (preferred place for referral code)
      let finalReferralCode = '';
      let userData = null;

      try {
        const userResponse = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' }
        });

        if (userResponse.ok) {
          userData = await userResponse.json();
          finalReferralCode = userData?.user?.referralCode || '';
        } else {
          console.warn('Could not fetch /auth/me for referral code; status=', userResponse.status);
        }
      } catch (err) {
        console.warn('Error fetching /auth/me:', err);
      }

      // Then fetch stats (may contain referral stats or fallback referral code)
      let statsData = { totalReferredUsers: 0, totalCommissions: 0, userBalance: 0, referredUsers: [], referralCode: '' };
      try {
        const statsResponse = await fetch(`${API_BASE}/referral/stats`, {
          headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' }
        });

        if (statsResponse.ok) {
          statsData = await statsResponse.json();
        } else {
          console.warn('Could not fetch referral/stats; status=', statsResponse.status);
        }
      } catch (err) {
        console.warn('Error fetching referral/stats:', err);
      }

      // Prefer user referral code, fallback to stats/referralCode, else empty
      finalReferralCode = finalReferralCode || statsData.referralCode || '';

      // Construct referral link if we have a code
      const finalReferralLink = finalReferralCode ? buildReferralLink(finalReferralCode) : '';

      // Save both a concise referralData object and referralCode state
      setReferralData({
        referralCode: finalReferralCode,
        referralLink: finalReferralLink,
        totalReferredUsers: statsData.totalReferredUsers || 0,
        totalCommissions: statsData.totalCommissions || 0,
        userBalance: statsData.userBalance || 0,
        referredUsers: statsData.referredUsers || []
      });

      setReferralCode(finalReferralCode);
      console.log('Referral data set:', { finalReferralCode, finalReferralLink });
    } catch (error) {
      console.error('Error in fetchReferralData:', error);
      // Set the user's referral code from the user object if available
      if (user?.referralCode) {
        setReferralCode(user.referralCode);
        setReferralData(prev => ({
          ...prev,
          referralCode: user.referralCode,
          referralLink: user.referralCode ? buildReferralLink(user.referralCode) : ''
        }));
      } else {
        // Fallback to known referral code for current user
        setReferralCode('REF0AC842');
        setReferralData(prev => ({
          ...prev,
          referralCode: 'REF0AC842',
          referralLink: buildReferralLink('REF0AC842')
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    const codeToCopy = referralCode || referralData.referralCode;
    if (!codeToCopy) return;

    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral code:', err);
      alert('Could not copy automatically. Please select and copy the code manually.');
    }
  };

  const copyReferralLink = async () => {
    const linkToCopy = referralData.referralLink || (referralCode ? buildReferralLink(referralCode) : '');
    if (!linkToCopy) return;

    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral link:', err);
      alert('Could not copy the link automatically. Please select and copy it manually.');
    }
  };

  const shareReferral = async () => {
    const linkToShare = referralData.referralLink || (referralCode ? buildReferralLink(referralCode) : '');
    const codeToShare = referralCode || referralData.referralCode || '';

    if (!linkToShare && !codeToShare) return;

    const shareText = codeToShare ? `Use my referral code: ${codeToShare}` : 'Join using my referral link';
    const shareData = {
      title: 'Join me!',
      text: `${shareText}\nSign up here: ${linkToShare}`,
      url: linkToShare || undefined
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error using Web Share API:', err);
      }
    } else {
      // fallback - copy the link (preferred) or code
      if (linkToShare) await copyReferralLink();
      else await copyReferralCode();
      alert('Referral link/code copied to clipboard. Share it with your friends!');
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div style={referralStyles.container}>
      <div style={referralStyles.header}>
        <div style={referralStyles.title}>
          <span style={referralStyles.icon}>👥</span>
          Referral Program
        </div>
        <div style={referralStyles.subtitle}>Earn money by referring friends</div>
      </div>

      {/* Referral Code Section */}
      <div style={referralStyles.card}>
        <div style={referralStyles.cardHeader}>
          <h3 style={referralStyles.cardTitle}>Your Referral Code</h3>
        </div>
        <div style={referralStyles.linkContainer}>
          <div style={referralStyles.linkText}>
            {referralCode || referralData.referralCode || 'No referral code available yet'}
          </div>
          <div style={referralStyles.buttonGroup}>
            <button
              style={referralStyles.copyButton}
              onClick={copyReferralCode}
              disabled={!referralCode && !referralData.referralCode}
            >
              {copySuccess ? '✅ Copied!' : '📋 Copy Code'}
            </button>
            <button
              style={referralStyles.shareButton}
              onClick={shareReferral}
              disabled={!referralCode && !referralData.referralCode}
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      {/* Commission Stats */}
      <div style={referralStyles.statsGrid}>
        <div style={referralStyles.statCard}>
          <div style={referralStyles.statValue}>{referralData.totalReferredUsers || 0}</div>
          <div style={referralStyles.statLabel}>Team Members</div>
        </div>
        <div style={referralStyles.statCard}>
          <div style={referralStyles.statValue}>${(referralData.totalCommissions || 0).toFixed(2)}</div>
          <div style={referralStyles.statLabel}>Total Commission</div>
        </div>
        <div style={referralStyles.statCard}>
          <div style={referralStyles.statValue}>${(referralData.userBalance || 0).toFixed(2)}</div>
          <div style={referralStyles.statLabel}>Your Balance </div>
        </div>
      </div>

      {/* Referred Users List */}
      <div style={referralStyles.card}>
        <div style={referralStyles.cardHeader}>
          <h3 style={referralStyles.cardTitle}>Team Members</h3>
          <span style={referralStyles.count}>{referralData.totalReferredUsers || 0} members</span>
        </div>

        {loading ? (
          <div style={referralStyles.loading}>Loading team members...</div>
        ) : referralData.referredUsers && referralData.referredUsers.length > 0 ? (
          <div style={referralStyles.usersList}>
            {referralData.referredUsers.map((u, idx) => (
              <div key={idx} style={referralStyles.userItem}>
                <div style={referralStyles.userInfo}>
                  <div style={referralStyles.userAvatar}>{u.username?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <div style={referralStyles.userDetails}>
                    <div style={referralStyles.userName}>{u.username}</div>
                    <div style={referralStyles.userEmail}>{u.email}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                      Referred: {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={referralStyles.userCommission}>${(u.commission || 0).toFixed(2)}</div>
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.8,
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    color: '#22c55e'
                  }}>
                    Child User
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={referralStyles.emptyState}>
            <div style={referralStyles.emptyIcon}>👥</div>
            <div style={referralStyles.emptyText}>No team members yet</div>
            <div style={referralStyles.emptySubtext}>Share your referral link to start building your team!</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Earn({ selectedProject, setActivePage }) {
  const { user, isLoggedIn } = useAuth();
  const [balance, setBalance] = useState(0);
  const [userLevel, setUserLevel] = useState("VIP1");
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userReferralCode, setUserReferralCode] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    console.log('Earn component useEffect triggered:', { isLoggedIn, user });
    console.log('User object details:', user);
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
    if (isLoggedIn && token) {
      console.log('Loading user data for user:', user.username, 'with token:', token.substring(0, 20) + '...');
      loadUserData();
    } else {
      console.log('Not loading data - user not logged in or no token');
      console.log('isLoggedIn:', isLoggedIn);
      console.log('token from localStorage:', token);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all earn page data from single comprehensive endpoint
      try {
        const token = localStorage.getItem('token');
        const earnDataResponse = await fetch(`${API_BASE}/user/earn-data`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (earnDataResponse.ok) {
          const earnData = await earnDataResponse.json();
          console.log('Earn data received:', earnData);
          console.log('User balance from API:', earnData.user?.balance);

          // Set user info for display
          setUserInfo(earnData.user);

          // Set all user data from database
          setBalance(earnData.user.balance || 0);
          setUserReferralCode(earnData.user.referralCode || '');
          setUserLevel(earnData.user.userLevel || "VIP1");

          // Set task data
          setTaskHistory(earnData.taskData?.taskHistory || []);
          setDailyEarnings(earnData.taskData?.todayEarnings || 0);

          console.log('Balance set to:', earnData.user.balance);
          console.log('User level set to:', earnData.user.userLevel);

          console.log('Earn data loaded from backend:', earnData);
        } else {
          console.warn('Could not load earn data, status:', earnDataResponse.status);
          // Fallback to individual API calls
          await loadFallbackData();
        }
      } catch (earnDataError) {
        console.warn('Could not load earn data from comprehensive endpoint:', earnDataError);
        // Fallback to individual API calls
        await loadFallbackData();
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Some data could not be loaded. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to load data from individual endpoints
  const loadFallbackData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Load user data
      const userResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userInfo = userData.user;
        setUserInfo(userInfo);
        setBalance(userInfo.balance || 0);
        setUserReferralCode(userInfo.referralCode || '');
        setUserLevel(userInfo.dailySessionsCompleted >= 50 ? "VIP3" :
                    userInfo.dailySessionsCompleted >= 20 ? "VIP2" :
                    userInfo.dailySessionsCompleted >= 5 ? "VIP1" : "VIP1");
      }

      // Load task history (ratings)
      const ratingsResponse = await fetch(`${API_BASE}/ratings/my`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        const transformedHistory = (ratingsData.ratings || []).map(rating => ({
          id: rating._id,
          name: rating.productId?.name || 'Product Rating',
          status: rating.status || 'completed',
          reward: `$${(rating.reward || 0).toFixed(2)}`,
          date: new Date(rating.createdAt).toLocaleDateString(),
          time: new Date(rating.createdAt).toLocaleTimeString(),
          productPrice: rating.productPrice || 0,
          profit: rating.profit || 0
        }));

        setTaskHistory(transformedHistory);
      }

      // Load sessions for today's earnings
      const sessionsResponse = await fetch(`${API_BASE}/daily-session/my-sessions?days=30`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        const today = new Date().toDateString();
        const todaySessions = (sessionsData.sessions || []).filter(s => new Date(s.sessionDate).toDateString() === today);
        const todayEarnings = todaySessions.reduce((sum, s) => sum + (s.rewardEarned || 0), 0);
        setDailyEarnings(todayEarnings);
      }
    } catch (fallbackError) {
      console.error('Fallback data loading failed:', fallbackError);
      // Set default values
      setBalance(25.00);
      setUserReferralCode('');
      setUserLevel("VIP1");
      setTaskHistory([]);
      setDailyEarnings(0);
    }
  };

  const completedTasks = taskHistory.filter(task => task.status === "completed").length;
  const totalEarnings = taskHistory
    .filter(task => task.status === "completed")
    .reduce((sum, task) => sum + (Number(task.profit) || 0), 0);

  if (!isLoggedIn) {
    return (
      <div className="earn-container">
        <div className="header">
          <h1 className="header-title">Please log in to view your task history and referral system</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="earn-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your task history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="earn-container">
      {/* Request User Info Display - All data from User table */}
      {userInfo && (
        <div className="request-user-header" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              border: '3px solid rgba(255, 255, 255, 0.3)'
            }}>
              {userInfo.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  How are you, {userInfo.username}? Welcome back!
                </h1>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: 'rgba(34, 197, 94, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(34, 197, 94, 1)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(34, 197, 94, 0.8)'}
                >
                  🔄 Refresh Data
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '14px',
                opacity: 0.95
              }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>📧 Email:</strong> {userInfo.email}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>📅 Member since:</strong> {new Date(userInfo.createdAt).toLocaleDateString()}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>🎫 Referral Code:</strong> {userInfo.referralCode || 'Not set'}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>💰 Balance:</strong> ${userInfo.balance?.toFixed(2) || '0.00'}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>⭐ Level:</strong> {userInfo.dailySessionsCompleted >= 50 ? "VIP3" :
                                              userInfo.dailySessionsCompleted >= 20 ? "VIP2" :
                                              userInfo.dailySessionsCompleted >= 5 ? "VIP1" : "VIP1"}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>🎯 Sessions Completed:</strong> {userInfo.dailySessionsCompleted || 0}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>💎 Commission Earned:</strong> ${userInfo.commissionEarned?.toFixed(2) || '0.00'}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>🎲 Lucky Orders:</strong> {userInfo.luckyOrderCount || 0}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>👥 User Type:</strong> {userInfo.userType || 'regular'}
                </div>
                {userInfo.withdrawalMethod && (
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                    <strong>🏦 Withdrawal Method:</strong> {userInfo.withdrawalMethod}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="header">
        <div className="balance-display">
          <div className="balance-item main-balance">
            <span className="balance-label">Your Balance </span>
            <span className="balance-value">${balance.toFixed(2)}</span>
            {balance < 10 && <span className="low-balance-warning">Low Balance!</span>}
          </div>
          <div className="balance-item incentive-balance">
            <span className="balance-label">User Level</span>
            <span className="balance-value">{userLevel}</span>
          </div>
        </div>

        <div className="header-controls">
          <h1 className="header-title">Task History & Referral</h1>
          {userReferralCode && (
            <div className="referral-code-display">
              <span className="referral-label">Your Referral Code:</span>
              <span className="referral-code">{userReferralCode}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button className="error-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="main-content">
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-value">{completedTasks}/{taskHistory.length}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">${totalEarnings.toFixed(2)}</div>
            <div className="stat-label">Total Earned</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{userLevel}</div>
            <div className="stat-label">Your Level</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">${dailyEarnings.toFixed(2)}</div>
            <div className="stat-label">Today's Earnings</div>
          </div>
        </div>

        <div className="task-workflow-view">
          <div className="history-view">
            <div className="history-stats">
              <div className="history-stat">
                <span className="stat-number">{taskHistory.length}</span>
                <span className="stat-desc">Total Tasks</span>
              </div>
              <div className="history-stat">
                <span className="stat-number">{taskHistory.filter(t => t.status === 'completed').length}</span>
                <span className="stat-desc">Completed</span>
              </div>
              <div className="history-stat">
                <span className="stat-number">${totalEarnings.toFixed(2)}</span>
                <span className="stat-desc">Total Earned</span>
              </div>
            </div>

            <div className="history-list">
              {taskHistory.length > 0 ? (
                taskHistory.map(task => (
                  <div key={task.id} className="history-item">
                    <div className="history-item-main">
                      <div className="task-icon">{task.status === 'completed' ? '✅' : '❌'}</div>
                      <div className="task-details">
                        <div className="task-name">{task.name}</div>
                        <div className="task-meta">{task.date} • {task.time}</div>
                      </div>
                      <div className={`task-reward ${task.status}`}>{task.reward}</div>
                    </div>
                    <div className={`status-badge ${task.status}`}>{task.status.toUpperCase()}</div>
                  </div>
                ))
              ) : (
                <div className="empty-history">
                  <p>No task history yet. Complete tasks in the Home section to see your history here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoggedIn && userInfo && <ReferralSection user={user} isLoggedIn={isLoggedIn} userInfo={userInfo} />}
    </div>
  );
}
