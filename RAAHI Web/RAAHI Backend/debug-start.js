console.log('🔍 Starting debug script...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

try {
  console.log('📂 Checking required files...');
  
  // Check if server.js exists
  const fs = require('fs');
  if (fs.existsSync('./server.js')) {
    console.log('✅ server.js found');
  } else {
    console.log('❌ server.js not found');
    process.exit(1);
  }
  
  // Check if package.json exists
  if (fs.existsSync('./package.json')) {
    console.log('✅ package.json found');
  } else {
    console.log('❌ package.json not found');
    process.exit(1);
  }
  
  // Check if node_modules exists
  if (fs.existsSync('./node_modules')) {
    console.log('✅ node_modules found');
  } else {
    console.log('❌ node_modules not found - run npm install');
    process.exit(1);
  }
  
  console.log('📦 Loading .env file...');
  require('dotenv').config();
  console.log('✅ .env loaded');
  
  console.log('📦 Testing express import...');
  const express = require('express');
  console.log('✅ Express loaded');
  
  console.log('🚀 Now attempting to start server...');
  require('./server.js');
  
} catch (error) {
  console.error('❌ Error during startup:');
  console.error(error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}