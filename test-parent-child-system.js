// test-parent-child-system.js
// Comprehensive test script for the Parent-Child Daily Task Reward System

const API_BASE_URL = 'http://localhost:5000/api';

// Helper functions
const makeRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Test functions
const testBackendConnection = async () => {
  console.log('🧪 Testing Backend Connection...');
  
  try {
    // Test basic endpoint
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const productsData = await productsResponse.json();
    
    console.log('✅ Backend Connection: PASSED');
    console.log(`📦 Products Available: ${productsData.products?.length || 0}`);
    
    return true;
  } catch (error) {
    console.error('❌ Backend Connection: FAILED');
    console.error('💥 Error:', error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  console.log('🧪 Testing User Registration...');
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123'
  };
  
  try {
    const response = await makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });
    
    console.log('✅ User Registration: PASSED');
    console.log(`👤 Created User: ${response.user?.username}`);
    console.log(`🪙 Token Received: ${response.token ? 'Yes' : 'No'}`);
    
    // Store token for further tests
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  } catch (error) {
    console.error('❌ User Registration: FAILED');
    console.error('💥 Error:', error.message);
    return null;
  }
};

const testDailySession = async () => {
  console.log('🧪 Testing Daily Session System...');
  
  try {
    // Start a daily session
    const startResponse = await makeRequest('/daily-session/start', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    console.log('✅ Daily Session Start: PASSED');
    console.log(`🎯 Session ID: ${startResponse.session?.id}`);
    console.log(`📊 Tasks: ${startResponse.session?.tasksCompleted}/10`);
    
    // Get session stats
    const statsResponse = await makeRequest('/daily-session/stats');
    console.log('✅ Session Stats: PASSED');
    console.log(`📈 Total Sessions: ${statsResponse.stats?.totalSessions || 0}`);
    
    return startResponse.session;
  } catch (error) {
    console.error('❌ Daily Session: FAILED');
    console.error('💥 Error:', error.message);
    return null;
  }
};

const testParentChildRelationships = async () => {
  console.log('🧪 Testing Parent-Child Relationships...');
  
  try {
    // Get relationships
    const relationshipsResponse = await makeRequest('/users/parent-child-relationships');
    
    console.log('✅ Parent-Child Relationships: PASSED');
    console.log(`👥 User Type: ${relationshipsResponse.user?.userType || 'unknown'}`);
    console.log(`👨‍👩‍👧‍👦 Child Count: ${relationshipsResponse.relationships?.childCount || 0}`);
    
    return relationshipsResponse;
  } catch (error) {
    console.error('❌ Parent-Child Relationships: FAILED');
    console.error('💥 Error:', error.message);
    return null;
  }
};

const testTaskCompletion = async (sessionId) => {
  console.log('🧪 Testing Task Completion...');
  
  try {
    // Get products for testing
    const productsResponse = await makeRequest('/products');
    const products = productsResponse.products;
    
    if (!products || products.length === 0) {
      throw new Error('No products available for testing');
    }
    
    const testProduct = products[0];
    console.log(`🛍️ Testing with Product: ${testProduct.name}`);
    
    // Complete a task
    const completionResponse = await makeRequest('/daily-session/complete-task', {
      method: 'POST',
      body: JSON.stringify({ productId: testProduct._id }),
    });
    
    console.log('✅ Task Completion: PASSED');
    console.log(`💰 Profit: $${completionResponse.profit?.toFixed(2) || '0.00'}`);
    console.log(`🎉 Lucky Order: ${completionResponse.session?.luckyOrderTriggered ? 'YES!' : 'No'}`);
    
    if (completionResponse.session?.luckyOrderCommission) {
      console.log(`🍀 Lucky Commission: $${completionResponse.session.luckyOrderCommission.toFixed(2)}`);
    }
    
    return completionResponse;
  } catch (error) {
    console.error('❌ Task Completion: FAILED');
    console.error('💥 Error:', error.message);
    return null;
  }
};

const testUserBalance = async () => {
  console.log('🧪 Testing User Balance System...');
  
  try {
    const balanceResponse = await makeRequest('/user/balance');
    
    console.log('✅ User Balance: PASSED');
    console.log(`💰 Current Balance: $${balanceResponse.balance?.toFixed(2) || '0.00'}`);
    console.log(`👤 User: ${balanceResponse.user?.username}`);
    
    return balanceResponse;
  } catch (error) {
    console.error('❌ User Balance: FAILED');
    console.error('💥 Error:', error.message);
    return null;
  }
};

const testDepositSystem = async () => {
  console.log('🧪 Testing Deposit System...');
  
  try {
    const depositResponse = await makeRequest('/user/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount: 50 }),
    });
    
    console.log('✅ Deposit System: PASSED');
    console.log(`💰 Deposit Amount: $${depositResponse.depositAmount?.toFixed(2)}`);
    console.log(`💰 New Balance: $${depositResponse.newBalance?.toFixed(2)}`);
    
    return depositResponse;
  } catch (error) {
    console.error('❌ Deposit System: FAILED');
    console.error('💥 Error:', error.message);
    return null;
  }
};

// Main test runner
const runFullSystemTest = async () => {
  console.log('🚀 Starting Full Parent-Child System Test...\n');
  
  // Clear localStorage first
  localStorage.clear();
  
  const results = {
    backendConnection: false,
    userRegistration: false,
    dailySession: false,
    parentChildRelations: false,
    taskCompletion: false,
    userBalance: false,
    depositSystem: false
  };
  
  try {
    // Test 1: Backend Connection
    results.backendConnection = await testBackendConnection();
    console.log('');
    
    if (!results.backendConnection) {
      throw new Error('Backend connection failed. Cannot proceed with tests.');
    }
    
    // Test 2: User Registration
    const user = await testUserRegistration();
    results.userRegistration = !!user;
    console.log('');
    
    if (!user) {
      throw new Error('User registration failed. Cannot proceed with authenticated tests.');
    }
    
    // Test 3: User Balance
    results.userBalance = !!await testUserBalance();
    console.log('');
    
    // Test 4: Parent-Child Relationships
    results.parentChildRelations = !!await testParentChildRelationships();
    console.log('');
    
    // Test 5: Deposit System (to ensure we have balance for task completion)
    results.depositSystem = !!await testDepositSystem();
    console.log('');
    
    // Test 6: Daily Session
    const session = await testDailySession();
    results.dailySession = !!session;
    console.log('');
    
    // Test 7: Task Completion (if we have a session)
    if (session) {
      results.taskCompletion = !!await testTaskCompletion(session.id);
      console.log('');
    }
    
  } catch (error) {
    console.error('💥 Critical Error:', error.message);
  }
  
  // Summary
  console.log('📊 TEST RESULTS SUMMARY:');
  console.log('=====================================');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${test.padEnd(25)} ${status}`);
  });
  
  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  console.log('=====================================');
  console.log(`🎯 Overall Score: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED! Parent-Child System is fully functional!');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }
  
  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runFullSystemTest = runFullSystemTest;
  console.log('🧪 Test script loaded. Run: runFullSystemTest()');
}

// For Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runFullSystemTest };
}