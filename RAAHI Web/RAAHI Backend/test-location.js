#!/usr/bin/env node

/**
 * Test script to verify panic button location data flow
 * This script simulates a panic button click and shows the location data being sent
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Simulate test location data (Delhi, India coordinates)
const testLocationData = {
  email: 'test@example.com',
  location: {
    latitude: 28.6139,
    longitude: 77.2090
  },
  timestamp: new Date().toISOString(),
  userAgent: 'Test-Script-Location-Verification',
  status: 'active',
  userId: 'test_user_location_check'
};

async function testPanicWithLocation() {
  console.log('🧪 TESTING PANIC BUTTON LOCATION FLOW');
  console.log('=====================================\n');
  
  try {
    console.log('📍 Test location data being sent:');
    console.log(JSON.stringify(testLocationData, null, 2));
    console.log('\n🔄 Sending panic alert to backend...\n');
    
    // Send panic alert to backend
    const response = await axios.post(`${BASE_URL}/api/emergency/panic`, testLocationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ BACKEND RESPONSE:');
    console.log('Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 SUCCESS! Location was successfully sent and stored:');
      console.log(`📍 Location: ${response.data.location.latitude}, ${response.data.location.longitude}`);
      console.log(`🆔 Alert ID: ${response.data.alertId}`);
      console.log(`📂 Firestore Path: ${response.data.firestorePath}`);
      
      // Now fetch alerts to verify it was stored
      console.log('\n🔍 Verifying alert was stored...');
      const alertsResponse = await axios.get(`${BASE_URL}/api/emergency/panic-alerts`);
      
      if (alertsResponse.data.success && alertsResponse.data.alerts.length > 0) {
        const latestAlert = alertsResponse.data.alerts[0];
        console.log('✅ Alert found in database:');
        console.log(`📍 Stored Location: ${latestAlert.latitude}, ${latestAlert.longitude}`);
        console.log(`👤 User: ${latestAlert.userEmail}`);
        console.log(`🕒 Timestamp: ${latestAlert.timestampFormatted}`);
      }
    } else {
      console.log('❌ FAILED to send panic alert');
    }
    
  } catch (error) {
    console.error('❌ ERROR during test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Instructions for manual testing
function printManualTestInstructions() {
  console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
  console.log('================================');
  console.log('1. Open your RAAHI frontend in browser');
  console.log('2. Navigate to tourist dashboard');
  console.log('3. Open browser DevTools (F12) -> Console tab');
  console.log('4. Click the PANIC button');
  console.log('5. Look for these console messages:');
  console.log('   📍 "Requesting user location..."');
  console.log('   ✅ "Location acquired: [lat], [lng] (±[accuracy]m)"');
  console.log('   📍 "Final panic data being sent:" (shows location status)');
  console.log('   🚨 "PANIC ALERT SENT WITH LOCATION:" (final confirmation)');
  console.log('6. Check the success popup - it should show location coordinates');
  console.log('7. Check admin dashboard to see if alert appears with location\n');
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await axios.get(`${BASE_URL}/api/emergency/test-firebase`);
    console.log('✅ Backend is running and Firebase is connected');
    return true;
  } catch (error) {
    console.log('❌ Backend is not running or Firebase is not connected');
    console.log('Please start the backend server first: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const isBackendRunning = await checkBackend();
  
  if (isBackendRunning) {
    await testPanicWithLocation();
  }
  
  printManualTestInstructions();
}

main();