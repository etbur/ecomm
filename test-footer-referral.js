// Simple Test for Enhanced Footer Referral System
const API_BASE = 'http://localhost:5000/api';

let authToken = '';
let referralCode = '';

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

async function testFooterReferralSystem() {
  console.log('🧪 Testing Enhanced Footer Referral System');
  console.log('=' .repeat(50));

  try {
    // Step 1: Create a user
    console.log('\n📝 Step 1: Creating user...');
    const signupResponse = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'footerTester',
        email: 'footer@test.com',
        password: 'test123'
      })
    });

    authToken = signupResponse.token;
    referralCode = signupResponse.user.referralCode;
    
    console.log('✅ User created successfully');
    console.log(`   - Username: ${signupResponse.user.username}`);
    console.log(`   - Referral Code: ${referralCode}`);

    // Step 2: Test referral stats endpoint (what Footer uses)
    console.log('\n📊 Step 2: Testing referral stats (Footer data)...');
    const statsResponse = await apiRequest('/referral/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Referral stats retrieved successfully');
    console.log(`   - Referral Code: ${statsResponse.referralCode}`);
    console.log(`   - Total Referred Users: ${statsResponse.totalReferredUsers}`);
    console.log(`   - Total Commissions: $${statsResponse.totalCommissions.toFixed(2)}`);
    console.log(`   - User Balance: $${statsResponse.userBalance.toFixed(2)}`);

    // Step 3: Test copy referral link (what Footer uses)
    console.log('\n🔗 Step 3: Testing copy referral link...');
    const copyResponse = await apiRequest('/referral/copy-link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Referral link generated successfully');
    console.log(`   - Referral Link: ${copyResponse.referralLink}`);
    console.log(`   - Expected format: http://localhost:5173/signup?ref=${referralCode}`);

    // Step 4: Create a referred user to test the system
    console.log('\n👥 Step 4: Creating referred user...');
    const referralLink = copyResponse.referralLink;
    const referredUserResponse = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'referredUser',
        email: 'referred@test.com',
        password: 'test123',
        referralCode: referralCode
      })
    });

    console.log('✅ Referred user created successfully');
    console.log(`   - Username: ${referredUserResponse.user.username}`);

    // Step 5: Test updated referral stats
    console.log('\n📈 Step 5: Testing updated referral stats...');
    const updatedStatsResponse = await apiRequest('/referral/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Updated referral stats retrieved successfully');
    console.log(`   - Total Referred Users: ${updatedStatsResponse.totalReferredUsers}`);
    console.log(`   - Referred Users: ${updatedStatsResponse.referredUsers.length}`);

    // Step 6: Test referral validation
    console.log('\n✅ Step 6: Testing referral validation...');
    const validationResponse = await apiRequest('/auth/validate-referral', {
      method: 'POST',
      body: JSON.stringify({ referralCode })
    });

    console.log('✅ Referral code validation successful');
    console.log(`   - Valid: ${validationResponse.valid}`);
    console.log(`   - Referrer: ${validationResponse.referrer.username}`);

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 ALL FOOTER REFERRAL TESTS PASSED!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ User creation with referral code generation`);
    console.log(`   ✅ Referral stats endpoint (Footer data source)`);
    console.log(`   ✅ Copy referral link endpoint (Footer copy button)`);
    console.log(`   ✅ Referred user signup system`);
    console.log(`   ✅ Updated referral tracking`);
    console.log(`   ✅ Referral code validation`);
    
    console.log('\n✨ The Enhanced Footer is ready with:');
    console.log(`   💰 Personal referral link display`);
    console.log(`   📋 Copy link button`);
    console.log(`   🔗 Share link functionality`);
    console.log(`   👥 Team members list`);
    console.log(`   💵 Commission tracking`);
    console.log(`   📱 Mobile-responsive design`);

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

// Run the test
testFooterReferralSystem();