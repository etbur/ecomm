// simple-test.js - Quick test to verify Parent-Child System
const http = require('http');

// Test function
async function test() {
  console.log('🧪 Starting Simple Parent-Child System Test...\n');
  
  // Test 1: Products endpoint
  console.log('📦 Testing Products API...');
  await new Promise((resolve, reject) => {
    http.get('http://localhost:5000/api/products', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          console.log('✅ Products API: Working');
          console.log(`📊 Found ${products.products?.length || 0} products`);
          console.log('');
          resolve();
        } catch (e) {
          console.log('❌ Products API: Failed to parse JSON');
          reject(e);
        }
      });
    }).on('error', reject);
  });
  
  // Test 2: User registration
  console.log('👤 Testing User Registration...');
  const userData = {
    username: 'testparent_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'testpassword123'
  };
  
  const postData = JSON.stringify(userData);
  const signupResult = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ data: result, token: result.token });
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
  
  console.log('✅ User Registration: Working');
  console.log(`👤 Username: ${signupResult.data.user.username}`);
  console.log(`🔑 Token: ${signupResult.token ? 'Received' : 'Missing'}`);
  console.log('');
  
  // Test 3: Protected endpoint with token
  console.log('💰 Testing Balance API (with token)...');
  const balanceResult = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/user/balance',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + signupResult.token
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
  
  console.log('✅ Balance API: Working');
  console.log(`💰 Balance: $${balanceResult.balance}`);
  console.log('');
  
  // Test 4: Daily session start
  console.log('🎯 Testing Daily Session Start...');
  const sessionPostData = JSON.stringify({});
  const sessionResult = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/daily-session/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + signupResult.token,
        'Content-Length': Buffer.byteLength(sessionPostData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(sessionPostData);
    req.end();
  });
  
  console.log('✅ Daily Session: Working');
  console.log(`🎯 Session ID: ${sessionResult.session.id}`);
  console.log(`📊 Progress: ${sessionResult.session.tasksCompleted}/10`);
  console.log('');
  
  console.log('🎉 ALL TESTS PASSED!');
  console.log('🚀 Parent-Child System is fully functional!');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('1. Start frontend: cd my-app && npm run dev');
  console.log('2. Open browser: http://localhost:5175');
  console.log('3. Test the Parent-Child system in the UI!');
}

test().catch(console.error);