const axios = require('axios');

async function testFrontendAPI() {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  console.log('🔍 Testing Frontend API Calls...\n');
  
  // Test cases from the screenshot
  const testCases = [
    { aadhaarNumber: '', description: 'Empty Aadhaar (like in screenshot)' },
    { aadhaarNumber: '123456789012', description: 'Valid Aadhaar (Test User1)' },
    { aadhaarNumber: '549861084965', description: 'Valid Aadhaar (Test User3)' },
    { aadhaarNumber: '999999999999', description: 'Non-existent Aadhaar' },
    { aadhaarNumber: '12345', description: 'Invalid Aadhaar (too short)' }
  ];
  
  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.description}`);
    console.log(`   Aadhaar: "${testCase.aadhaarNumber}"`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp-login`, {
        aadhaarNumber: testCase.aadhaarNumber
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      console.log('   ✅ Success:', response.data.message);
      if (response.data.mobileNumber) {
        console.log('   📱 Mobile:', response.data.mobileNumber);
      }
      
    } catch (error) {
      if (error.response) {
        console.log('   ❌ API Error:', error.response.data.message || 'Unknown error');
        if (error.response.data.errors) {
          console.log('   📝 Validation errors:');
          error.response.data.errors.forEach(err => {
            console.log(`      - ${err.msg}: ${err.path}`);
          });
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log('   🔌 Connection refused - Server not running');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   ⏰ Request timeout - Server not responding');
      } else {
        console.log('   💥 Network error:', error.message);
      }
    }
    console.log('');
  }
  
  // Test server health
  console.log('🏥 Testing Server Health...');
  try {
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health-check`);
    console.log('✅ Server is healthy:', healthResponse.data.message);
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
  }
  
  // Test CORS
  console.log('\n🔒 Testing CORS...');
  try {
    const corsResponse = await axios.options(`${API_BASE_URL}/auth/send-otp-login`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS preflight passed');
  } catch (error) {
    console.log('❌ CORS might be blocking:', error.message);
  }
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. Make sure both backend (port 5000) and frontend (port 3000) are running');
  console.log('2. Check browser console for detailed error messages');
  console.log('3. Verify network requests in browser DevTools');
  console.log('4. Ensure Aadhaar field is not empty when submitting');
}

testFrontendAPI().catch(console.error);