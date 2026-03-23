const axios = require('axios');
const colors = require('util'); // For colored output

// Test configuration
const BASE_URL = 'http://localhost:5000'; // Adjust if your server runs on different port
const ENDPOINT = '/api/auth/tourist-dept-login';

// Test cases
const testCases = [
  {
    name: 'Valid login - Uttar Pradesh (full name)',
    data: {
      state: 'Uttar Pradesh',
      password: 'aniket1234'
    },
    expectedSuccess: true
  },
  {
    name: 'Valid login - UP (abbreviation)',
    data: {
      state: 'UP',
      password: 'aniket1234'
    },
    expectedSuccess: true
  },
  {
    name: 'Valid login - up (lowercase)',
    data: {
      state: 'up',
      password: 'aniket1234'
    },
    expectedSuccess: true
  },
  {
    name: 'Valid login - uttar pradesh (lowercase)',
    data: {
      state: 'uttar pradesh',
      password: 'aniket1234'
    },
    expectedSuccess: true
  },
  {
    name: 'Invalid password',
    data: {
      state: 'Uttar Pradesh',
      password: 'wrongpassword'
    },
    expectedSuccess: false
  },
  {
    name: 'Invalid state',
    data: {
      state: 'Non Existent State',
      password: 'aniket1234'
    },
    expectedSuccess: false
  },
  {
    name: 'Missing state',
    data: {
      password: 'aniket1234'
    },
    expectedSuccess: false
  },
  {
    name: 'Missing password',
    data: {
      state: 'Uttar Pradesh'
    },
    expectedSuccess: false
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📋 Data:`, testCase.data);
  
  try {
    const response = await axios.post(`${BASE_URL}${ENDPOINT}`, testCase.data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    const success = response.data.success;
    const message = response.data.message;
    
    if (success === testCase.expectedSuccess) {
      console.log(`✅ PASS - Status: ${response.status}`);
      console.log(`📝 Response:`, message);
      
      if (success && response.data.token) {
        console.log(`🔑 Token received: ${response.data.token.substring(0, 20)}...`);
        if (response.data.user) {
          console.log(`👤 User:`, {
            name: `${response.data.user.firstName} ${response.data.user.lastName}`,
            location: response.data.user.location,
            role: response.data.user.role
          });
        }
      }
    } else {
      console.log(`❌ FAIL - Expected success: ${testCase.expectedSuccess}, got: ${success}`);
      console.log(`📝 Response:`, message);
    }
    
  } catch (error) {
    if (error.response) {
      const success = error.response.data?.success;
      const message = error.response.data?.message;
      
      if (success === testCase.expectedSuccess) {
        console.log(`✅ PASS - Status: ${error.response.status}`);
        console.log(`📝 Response:`, message);
        
        if (error.response.data?.availableStates) {
          console.log(`🗺️  Available states:`, error.response.data.availableStates.slice(0, 5), '...');
        }
      } else {
        console.log(`❌ FAIL - Expected success: ${testCase.expectedSuccess}, got: ${success}`);
        console.log(`📝 Response:`, message);
      }
    } else {
      console.log(`❌ NETWORK ERROR:`, error.message);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Tourist Department Login Tests');
  console.log('=' .repeat(50));
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running');
  } catch (error) {
    console.log('⚠️  Server might not be running. Starting tests anyway...');
  }
  
  let passCount = 0;
  let failCount = 0;
  
  for (const testCase of testCases) {
    try {
      await runTest(testCase);
      passCount++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    } catch (error) {
      failCount++;
      console.log(`❌ Test failed with error: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${testCases.length}`);
  
  if (failCount === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Instructions
console.log('📋 Tourist Department Login Test Instructions:');
console.log('1. Make sure your server is running (npm start or node server.js)');
console.log('2. Ensure the tourist department user exists in database');
console.log('3. Update BASE_URL if server runs on different port');
console.log('');

runAllTests().catch(console.error);