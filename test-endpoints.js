const http = require('http');

// Test data
const registerData = {
  username: 'testuser2',
  password: 'password123',
  email: 'testuser2@example.com'
};

const loginData = {
  username: 'testuser2',
  password: 'password123'
};

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test root endpoint
    console.log('1️⃣ Testing root endpoint...');
    const rootResponse = await makeRequest('/', 'GET');
    console.log(`   Status: ${rootResponse.status}`);
    console.log(`   Response: ${rootResponse.data}\n`);

    // Test register endpoint
    console.log('2️⃣ Testing register endpoint...');
    const registerResponse = await makeRequest('/auth/register', 'POST', registerData);
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response: ${registerResponse.data}\n`);

    // Test login endpoint
    console.log('3️⃣ Testing login endpoint...');
    const loginResponse = await makeRequest('/auth/login', 'POST', loginData);
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response: ${loginResponse.data}\n`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Wait a moment for server to start, then test
setTimeout(testEndpoints, 2000);
