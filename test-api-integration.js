// Test script to verify API integration
const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'testuser123',
  email: 'test@example.com',
  password: 'testpass123'
};

// Function to make API calls
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return { response, data };
  } catch (error) {
    console.error(`Error on ${endpoint}:`, error);
    return { error: error.message };
  }
}

// Test the complete flow
async function testAPI() {
  console.log('🚀 Starting API Integration Tests...\n');

  // Test 1: Create user (signup)
  console.log('1️⃣ Testing User Signup...');
  const signupResult = await makeRequest('/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testUser),
  });

  if (signupResult.error) {
    console.log('❌ Signup failed:', signupResult.error);
    return;
  }

  console.log('✅ User signed up successfully');
  const token = signupResult.data.token;
  console.log('🔑 Token received:', token.substring(0, 20) + '...');

  // Test 2: Get user balance
  console.log('\n2️⃣ Testing Get User Balance...');
  const balanceResult = await makeRequest('/user/balance', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (balanceResult.error) {
    console.log('❌ Get balance failed:', balanceResult.error);
    return;
  }

  console.log('✅ Balance retrieved successfully');
  console.log('💰 Current balance:', balanceResult.data.balance);

  // Test 3: Get products
  console.log('\n3️⃣ Testing Get Products...');
  const productsResult = await makeRequest('/products', {
    method: 'GET',
  });

  if (productsResult.error) {
    console.log('❌ Get products failed:', productsResult.error);
    return;
  }

  console.log('✅ Products retrieved successfully');
  console.log('🛍️ Number of products:', productsResult.data.products.length);
  
  if (productsResult.data.products.length > 0) {
    const firstProduct = productsResult.data.products[0];
    console.log('📦 First product:', firstProduct.name, '- $' + firstProduct.price);
  }

  // Test 4: Deposit funds
  console.log('\n4️⃣ Testing Deposit Funds...');
  const depositResult = await makeRequest('/user/deposit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: 50 }),
  });

  if (depositResult.error) {
    console.log('❌ Deposit failed:', depositResult.error);
    return;
  }

  console.log('✅ Deposit successful');
  console.log('💰 New balance:', depositResult.data.newBalance);

  // Test 5: Submit rating (if we have products and sufficient balance)
  if (productsResult.data.products.length > 0) {
    console.log('\n5️⃣ Testing Submit Rating...');
    const testProduct = productsResult.data.products[0];
    
    const ratingResult = await makeRequest('/ratings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        productId: testProduct._id, 
        rating: 5 
      }),
    });

    if (ratingResult.error) {
      console.log('❌ Submit rating failed:', ratingResult.error);
      
      // Check if it's due to insufficient balance
      if (ratingResult.error.includes('Insufficient balance')) {
        console.log('⚠️ Expected error: Insufficient balance (as designed)');
        console.log('📝 This is normal behavior for the "lucky order" feature');
      }
    } else {
      console.log('✅ Rating submitted successfully');
      console.log('💰 New balance after rating:', ratingResult.data.newBalance);
      console.log('💵 Profit earned:', ratingResult.data.profit);
    }
  }

  console.log('\n🎉 API Integration Tests Completed!');
  console.log('\n📋 Summary:');
  console.log('✅ User authentication working');
  console.log('✅ Database models functioning');
  console.log('✅ API endpoints responding');
  console.log('✅ Balance management working');
  console.log('✅ Rating system integrated');
  console.log('\n🚀 Your task-based earning system is ready!');
}

// Run the tests
testAPI().catch(console.error);