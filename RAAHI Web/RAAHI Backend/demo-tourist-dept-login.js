const axios = require('axios');

// Demo: How to login as Tourist Department using State + Password
async function demoTouristDepartmentLogin() {
  console.log('🏛️  Tourist Department Login Demo');
  console.log('=' .repeat(40));
  
  const BASE_URL = 'http://localhost:5000'; // Adjust if needed
  
  try {
    // Example login request
    const response = await axios.post(`${BASE_URL}/api/auth/tourist-dept-login`, {
      state: 'Uttar Pradesh',  // Can also use 'UP', 'up', 'uttar pradesh', etc.
      password: 'aniket1234'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login Successful!');
    console.log('📝 Message:', response.data.message);
    console.log('🔑 Token:', response.data.token.substring(0, 30) + '...');
    console.log('👤 User Details:');
    console.log('   - Name:', response.data.user.firstName, response.data.user.lastName);
    console.log('   - Email:', response.data.user.email);
    console.log('   - Role:', response.data.user.role);
    console.log('   - Location:', response.data.user.location);
    
    console.log('\\n🔍 How to use in your application:');
    console.log('```javascript');
    console.log('const response = await fetch("/api/auth/tourist-dept-login", {');
    console.log('  method: "POST",');
    console.log('  headers: { "Content-Type": "application/json" },');
    console.log('  body: JSON.stringify({');
    console.log('    state: "Uttar Pradesh",  // or "UP", "Maharashtra", "MH", etc.');
    console.log('    password: "your-password"');
    console.log('  })');
    console.log('});');
    console.log('');
    console.log('const data = await response.json();');
    console.log('if (data.success) {');
    console.log('  localStorage.setItem("authToken", data.token);');
    console.log('  // Redirect to dashboard');
    console.log('}');
    console.log('```');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Login Failed');
      console.log('📝 Error:', error.response.data.message);
      console.log('🏷️  Status:', error.response.status);
      
      if (error.response.data.availableStates) {
        console.log('🗺️  Available States:', error.response.data.availableStates.join(', '));
      }
    } else {
      console.log('❌ Network Error:', error.message);
      console.log('💡 Make sure your server is running on', BASE_URL);
    }
  }
}

console.log('📋 Prerequisites:');
console.log('1. Server must be running (npm start)');
console.log('2. Tourist department user must exist in database');
console.log('');

demoTouristDepartmentLogin();