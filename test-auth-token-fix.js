// Test script to verify the token authentication fix
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  console.log('🧪 Testing Authentication Flow...\n');

  // Test data
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    referralCode: 'REFDEMO123' // This should exist in the database
  };

  try {
    console.log('1. Testing User Signup...');
    
    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const signupData = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log('✅ Signup successful!');
      console.log('Token received:', signupData.token ? 'YES ✅' : 'NO ❌');
      console.log('User data:', JSON.stringify(signupData.user, null, 2));
      
      if (signupData.token) {
        console.log('\n2. Testing Token Validation...');
        
        // Test token validation with /auth/me endpoint
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${signupData.token}`,
            'Content-Type': 'application/json',
          },
        });

        const meData = await meResponse.json();
        
        if (meResponse.ok) {
          console.log('✅ Token validation successful!');
          console.log('User authenticated:', meData.user ? 'YES ✅' : 'NO ❌');
          console.log('User details:', JSON.stringify(meData.user, null, 2));
          
          console.log('\n3. Testing User Login...');
          
          // Test login with same credentials
          const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: testUser.email,
              password: testUser.password,
            }),
          });

          const loginData = await loginResponse.json();
          
          if (loginResponse.ok) {
            console.log('✅ Login successful!');
            console.log('Token received:', loginData.token ? 'YES ✅' : 'NO ❌');
            console.log('Token from signup:', signupData.token);
            console.log('Token from login:', loginData.token);
            console.log('Tokens match:', signupData.token === loginData.token ? 'YES ✅' : 'NO ❌');
            
            console.log('\n🎉 All authentication tests passed!');
            console.log('Token generation and validation is working correctly.');
          } else {
            console.log('❌ Login failed:', loginData.message);
          }
        } else {
          console.log('❌ Token validation failed:', meData.message);
        }
      } else {
        console.log('❌ No token received from signup');
      }
    } else {
      console.log('❌ Signup failed:', signupData.message);
      
      // If it's a referral code issue, let's test without it
      if (signupData.message && signupData.message.includes('referral')) {
        console.log('\n🔄 Testing signup without referral code...');
        
        const testUserNoRef = { ...testUser };
        delete testUserNoRef.referralCode;
        
        const signupResponse2 = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testUserNoRef),
        });

        const signupData2 = await signupResponse2.json();
        
        if (signupResponse2.ok) {
          console.log('✅ Signup without referral successful!');
          console.log('Token received:', signupData2.token ? 'YES ✅' : 'NO ❌');
        } else {
          console.log('❌ Signup without referral also failed:', signupData2.message);
        }
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run the test
testAuthentication();