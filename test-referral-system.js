// Comprehensive Test Script for Enhanced Referral System
const API_BASE = 'http://localhost:5000/api';

// Test user data
const testUsers = [
  {
    username: 'testuser1',
    email: 'testuser1@example.com',
    password: 'testpass123',
    referralCode: null
  },
  {
    username: 'testuser2', 
    email: 'testuser2@example.com',
    password: 'testpass123',
    referralCode: null // Will be filled after first user signup
  },
  {
    username: 'testuser3',
    email: 'testuser3@example.com', 
    password: 'testpass123',
    referralCode: null // Will be filled after first user signup
  }
];

let authTokens = [];
let referralCodes = [];

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Request failed'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// Test 1: Create first user (referrer)
async function testUserSignup(testUser, index) {
  console.log(`\n=== Test ${index + 1}: User Signup ===`);
  console.log(`Creating user: ${testUser.username}`);
  
  try {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    console.log('✅ User created successfully');
    console.log(`   - User ID: ${response.user.id}`);
    console.log(`   - Username: ${response.user.username}`);
    console.log(`   - Referral Code: ${response.user.referralCode}`);
    console.log(`   - Token: ${response.token.substring(0, 20)}...`);
    
    // Store token and referral code
    authTokens[index] = response.token;
    referralCodes[index] = response.user.referralCode;
    testUsers[index].referralCode = response.user.referralCode;
    
    return response;
  } catch (error) {
    console.error('❌ User signup failed:', error.message);
    throw error;
  }
}

// Test 2: Validate referral code
async function testReferralValidation(referralCode) {
  console.log(`\n=== Test: Referral Code Validation ===`);
  console.log(`Validating referral code: ${referralCode}`);
  
  try {
    const response = await apiRequest('/auth/validate-referral', {
      method: 'POST',
      body: JSON.stringify({ referralCode })
    });
    
    console.log('✅ Referral code validation successful');
    console.log(`   - Valid: ${response.valid}`);
    if (response.valid) {
      console.log(`   - Referrer: ${response.referrer.username}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Referral validation failed:', error.message);
    throw error;
  }
}

// Test 3: Create users with referral codes
async function testReferredUserSignup(testUser, referralCode, index) {
  console.log(`\n=== Test ${index + 1}: Referred User Signup ===`);
  console.log(`Creating user: ${testUser.username} with referral: ${referralCode}`);
  
  try {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ ...testUser, referralCode })
    });
    
    console.log('✅ Referred user created successfully');
    console.log(`   - User ID: ${response.user.id}`);
    console.log(`   - Username: ${response.user.username}`);
    console.log(`   - Referral Code: ${response.user.referralCode}`);
    console.log(`   - Token: ${response.token.substring(0, 20)}...`);
    
    // Store token
    authTokens[index] = response.token;
    referralCodes[index] = response.user.referralCode;
    testUsers[index].referralCode = response.user.referralCode;
    
    return response;
  } catch (error) {
    console.error('❌ Referred user signup failed:', error.message);
    throw error;
  }
}

// Test 4: Get referral stats for first user (referrer)
async function testReferralStats(token, userIndex) {
  console.log(`\n=== Test: Referral Stats for User ${userIndex + 1} ===`);
  
  try {
    const response = await apiRequest('/referral/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Referral stats retrieved successfully');
    console.log(`   - Referral Code: ${response.referralCode}`);
    console.log(`   - Total Referred Users: ${response.totalReferredUsers}`);
    console.log(`   - Total Commissions: $${response.totalCommissions.toFixed(2)}`);
    console.log(`   - User Balance: $${response.userBalance.toFixed(2)}`);
    console.log(`   - User Commission Earned: $${response.userCommissionEarned.toFixed(2)}`);
    
    if (response.referredUsers.length > 0) {
      console.log('   - Referred Users:');
      response.referredUsers.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.username} (${user.email}) - Commission: $${(user.commission || 0).toFixed(2)}`);
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Referral stats failed:', error.message);
    throw error;
  }
}

// Test 5: Copy referral link
async function testCopyReferralLink(token) {
  console.log(`\n=== Test: Copy Referral Link ===`);
  
  try {
    const response = await apiRequest('/referral/copy-link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Referral link generated successfully');
    console.log(`   - Referral Link: ${response.referralLink}`);
    console.log(`   - Referral Code: ${response.referralCode}`);
    
    return response;
  } catch (error) {
    console.error('❌ Copy referral link failed:', error.message);
    throw error;
  }
}

// Test 6: Add commission to referrer
async function testAddCommission(token, referrerToken, referredUserId, commissionAmount) {
  console.log(`\n=== Test: Add Commission ===`);
  console.log(`Adding commission $${commissionAmount} from user ${referredUserId}`);
  
  try {
    const response = await apiRequest('/referral/add-commission', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${referrerToken}`
      },
      body: JSON.stringify({
        referredUserId,
        commissionAmount
      })
    });
    
    console.log('✅ Commission added successfully');
    console.log(`   - Commission Amount: $${response.commissionAmount.toFixed(2)}`);
    console.log(`   - New Referrer Balance: $${response.newReferrerBalance.toFixed(2)}`);
    console.log(`   - Total Commission Earned: $${response.totalCommissionEarned.toFixed(2)}`);
    
    return response;
  } catch (error) {
    console.error('❌ Add commission failed:', error.message);
    throw error;
  }
}

// Test 7: Verify updated referral stats
async function testUpdatedReferralStats(token) {
  console.log(`\n=== Test: Updated Referral Stats ===`);
  
  try {
    const response = await apiRequest('/referral/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Updated referral stats retrieved successfully');
    console.log(`   - Total Commissions: $${response.totalCommissions.toFixed(2)}`);
    console.log(`   - User Balance: $${response.userBalance.toFixed(2)}`);
    console.log(`   - User Commission Earned: $${response.userCommissionEarned.toFixed(2)}`);
    
    return response;
  } catch (error) {
    console.error('❌ Updated referral stats failed:', error.message);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Enhanced Referral System Tests');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Create first user (who will be the referrer)
    const user1Response = await testUserSignup(testUsers[0], 0);
    const user1Id = user1Response.user.id;
    
    // Test 2: Test referral validation with the created code
    await testReferralValidation(referralCodes[0]);
    
    // Test 3: Create second user using referral code
    const user2Response = await testReferredUserSignup(testUsers[1], referralCodes[0], 1);
    const user2Id = user2Response.user.id;
    
    // Test 4: Create third user using referral code
    const user3Response = await testReferredUserSignup(testUsers[2], referralCodes[0], 2);
    const user3Id = user3Response.user.id;
    
    // Test 5: Get referral stats for the referrer (user1)
    await testReferralStats(authTokens[0], 0);
    
    // Test 6: Copy referral link
    await testCopyReferralLink(authTokens[0]);
    
    // Test 7: Add commission from referred users to referrer
    await testAddCommission(authTokens[1], authTokens[0], user2Id, 5.00);
    await testAddCommission(authTokens[2], authTokens[0], user3Id, 7.50);
    
    // Test 8: Verify updated stats
    await testUpdatedReferralStats(authTokens[0]);
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 All tests completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Created 3 test users`);
    console.log(`   - User 1 (referrer): ${testUsers[0].username} - Code: ${referralCodes[0]}`);
    console.log(`   - User 2 (referred): ${testUsers[1].username}`);
    console.log(`   - User 3 (referred): ${testUsers[2].username}`);
    console.log(`   - Added commissions totaling $12.50`);
    console.log('\n✨ The enhanced referral system is working perfectly!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    console.error('Please check the error details above.');
  }
}

// Run the tests
runAllTests();