const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Adjust port if different
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function for colored console output
const colorLog = (color, text) => console.log(`${COLORS[color]}${text}${COLORS.reset}`);

async function testPanicButton() {
  colorLog('bright', '🚨 PANIC BUTTON FUNCTIONALITY TEST');
  colorLog('bright', '='.repeat(50));
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Check server connectivity
  colorLog('cyan', '\n📡 Test 1: Server Connectivity');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    if (response.status === 200) {
      colorLog('green', '✅ Server is running and accessible');
      passedTests++;
    } else {
      throw new Error(`Server returned status ${response.status}`);
    }
  } catch (error) {
    colorLog('red', `❌ Server connectivity failed: ${error.message}`);
    colorLog('yellow', '💡 Make sure your server is running with: npm start');
    failedTests++;
    return { passed: passedTests, failed: failedTests };
  }
  
  // Test 2: Firebase connection test
  colorLog('cyan', '\n🔥 Test 2: Firebase Connection');
  try {
    const response = await axios.get(`${BASE_URL}/api/emergency/test-firebase`);
    if (response.data.success) {
      colorLog('green', '✅ Firebase connection is working');
      colorLog('blue', `   Project ID: ${response.data.projectId || 'Not configured'}`);
      colorLog('blue', `   Services: ${response.data.services?.join(', ') || 'None'}`);
      passedTests++;
    } else {
      throw new Error(response.data.message || 'Firebase test failed');
    }
  } catch (error) {
    colorLog('red', `❌ Firebase connection failed: ${error.response?.data?.message || error.message}`);
    colorLog('yellow', '💡 Check your Firebase configuration in .env file');
    failedTests++;
  }
  
  // Test 3: Simple panic button test (no auth)
  colorLog('cyan', '\n🧪 Test 3: Simple Panic Button Test');
  try {
    const response = await axios.post(`${BASE_URL}/api/emergency/test-panic`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data.success) {
      colorLog('green', '✅ Panic button test endpoint works');
      colorLog('blue', `   Alert ID: ${response.data.testAlert?.alertId}`);
      colorLog('blue', `   Location: ${response.data.testAlert?.location?.latitude}, ${response.data.testAlert?.location?.longitude}`);
      colorLog('blue', `   Firebase Path: ${response.data.testAlert?.firestorePath}`);
      passedTests++;
    } else {
      throw new Error(response.data.message || 'Panic test failed');
    }
  } catch (error) {
    colorLog('red', `❌ Panic button test failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.firebase?.error) {
      colorLog('yellow', `💡 Firebase error: ${error.response.data.firebase.error}`);
    }
    failedTests++;
  }
  
  // Test 4: Real panic button with location (anonymous)
  colorLog('cyan', '\n🚨 Test 4: Real Panic Button (Anonymous)');
  try {
    const testData = {
      location: {
        latitude: 28.6139, // Delhi
        longitude: 77.2090
      },
      email: 'test-anonymous@panic.com',
      timestamp: new Date().toISOString(),
      userAgent: 'Panic Button Test',
      status: 'active'
    };
    
    const response = await axios.post(`${BASE_URL}/api/emergency/panic`, testData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data.success) {
      colorLog('green', '✅ Real panic button works (anonymous user)');
      colorLog('blue', `   Alert ID: ${response.data.alertId}`);
      colorLog('blue', `   User ID: ${response.data.userId}`);
      colorLog('blue', `   Location: ${response.data.location?.latitude}, ${response.data.location?.longitude}`);
      colorLog('blue', `   Firebase Path: ${response.data.firestorePath}`);
      passedTests++;
    } else {
      throw new Error(response.data.message || 'Real panic button failed');
    }
  } catch (error) {
    colorLog('red', `❌ Real panic button failed: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  // Test 5: Panic button without location (should fail)
  colorLog('cyan', '\n📍 Test 5: Panic Button Without Location (Should Fail)');
  try {
    const response = await axios.post(`${BASE_URL}/api/emergency/panic`, {
      email: 'test@panic.com'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // This should fail
    if (!response.data.success) {
      colorLog('green', '✅ Correctly rejected panic button without location');
      colorLog('blue', `   Error message: ${response.data.message}`);
      passedTests++;
    } else {
      throw new Error('Should have failed without location');
    }
  } catch (error) {
    if (error.response?.status === 400 && !error.response.data.success) {
      colorLog('green', '✅ Correctly rejected panic button without location');
      colorLog('blue', `   Error message: ${error.response.data.message}`);
      passedTests++;
    } else {
      colorLog('red', `❌ Unexpected error: ${error.message}`);
      failedTests++;
    }
  }
  
  // Test 6: Get panic alerts
  colorLog('cyan', '\n📋 Test 6: Get Panic Alerts');
  try {
    const response = await axios.get(`${BASE_URL}/api/emergency/panic-alerts?limit=5`);
    
    if (response.data.success) {
      colorLog('green', `✅ Successfully retrieved ${response.data.count} panic alerts`);
      if (response.data.alerts && response.data.alerts.length > 0) {
        const alert = response.data.alerts[0];
        colorLog('blue', `   Latest alert: ${alert.alertId}`);
        colorLog('blue', `   User: ${alert.userName} (${alert.userEmail})`);
        colorLog('blue', `   Status: ${alert.status}`);
        colorLog('blue', `   Location: ${alert.latitude}, ${alert.longitude}`);
      }
      passedTests++;
    } else {
      throw new Error(response.data.message || 'Failed to get panic alerts');
    }
  } catch (error) {
    colorLog('red', `❌ Failed to get panic alerts: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  // Summary
  colorLog('bright', '\n' + '='.repeat(50));
  colorLog('bright', '📊 TEST SUMMARY');
  colorLog('green', `✅ Passed: ${passedTests}`);
  colorLog('red', `❌ Failed: ${failedTests}`);
  colorLog('bright', `📈 Total: ${passedTests + failedTests}`);
  
  if (failedTests === 0) {
    colorLog('green', '\n🎉 ALL TESTS PASSED! Your panic button is working correctly.');
  } else if (passedTests > failedTests) {
    colorLog('yellow', '\n⚠️  Some tests failed, but core functionality works.');
    colorLog('yellow', '💡 Check the failed tests above for details.');
  } else {
    colorLog('red', '\n🚨 PANIC BUTTON IS NOT WORKING PROPERLY!');
    colorLog('yellow', '💡 Please check the error messages above.');
  }
  
  return { passed: passedTests, failed: failedTests };
}

// Instructions and setup check
async function runSetupCheck() {
  colorLog('cyan', '📋 PANIC BUTTON SETUP CHECK');
  colorLog('bright', '='.repeat(30));
  
  colorLog('blue', '\n✅ Required Components:');
  colorLog('reset', '1. Server running (npm start)');
  colorLog('reset', '2. MongoDB connection');
  colorLog('reset', '3. Firebase Admin SDK configured');
  colorLog('reset', '4. Emergency routes loaded');
  
  colorLog('blue', '\n🔧 If tests fail, check:');
  colorLog('reset', '• Your .env file has Firebase credentials');
  colorLog('reset', '• Firebase Admin SDK is initialized');
  colorLog('reset', '• Server is running on correct port');
  colorLog('reset', '• Network connectivity');
  
  colorLog('bright', '\n🚀 Starting tests in 3 seconds...\n');
  
  // Wait 3 seconds
  for (let i = 3; i > 0; i--) {
    process.stdout.write(`${i}... `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('GO!\n');
}

// Main execution
async function main() {
  try {
    await runSetupCheck();
    const results = await testPanicButton();
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    colorLog('red', `\n💥 Test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  colorLog('yellow', '\n\n⚠️  Test interrupted by user');
  process.exit(130);
});

// Run if called directly
if (require.main === module) {
  main();
}