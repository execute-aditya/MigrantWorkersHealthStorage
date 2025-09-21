const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3001';

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function debugOTPIssue() {
  console.log('🔍 Comprehensive OTP Debug Tool');
  console.log('=================================\n');

  // Step 1: Check servers
  console.log('1️⃣ Checking server status...');
  
  try {
    const backendHealth = await axios.get(`${API_BASE_URL}/health-check`);
    console.log('✅ Backend server: Running');
    console.log('   Message:', backendHealth.data.message);
  } catch (error) {
    console.log('❌ Backend server: Not running');
    console.log('   Please start with: cd /path/to/project && node server.js');
    return;
  }

  try {
    const frontendCheck = await axios.get(FRONTEND_URL, { timeout: 5000 });
    console.log('✅ Frontend server: Running');
  } catch (error) {
    console.log('❌ Frontend server: Not running or not accessible');
    console.log('   Please start with: cd /path/to/project/client && PORT=3001 npm start');
  }

  // Step 2: System configuration check
  console.log('\n2️⃣ System configuration check...');
  try {
    const configResponse = await axios.get(`${API_BASE_URL}/auth/config-check`);
    console.log('✅ Configuration status:', configResponse.data.status);
    
    if (configResponse.data.config.twilio.configured) {
      console.log('✅ Twilio: Configured');
    } else {
      console.log('❌ Twilio: Not configured properly');
    }
    
    if (configResponse.data.config.database.connected) {
      console.log('✅ Database: Connected');
    } else {
      console.log('❌ Database: Not connected');
    }
  } catch (error) {
    console.log('❌ Config check failed:', error.message);
    return;
  }

  // Step 3: Check if test user exists
  console.log('\n3️⃣ Checking test users...');
  const testAadhaar = '123456789012';
  
  try {
    const otpTestResponse = await axios.post(`${API_BASE_URL}/auth/send-otp-login`, {
      aadhaarNumber: testAadhaar
    });
    console.log('✅ Test user exists:', testAadhaar);
    console.log('   Mobile:', otpTestResponse.data.mobileNumber);
    console.log('   User:', otpTestResponse.data.fullName);
    
    if (otpTestResponse.data.devOTP) {
      console.log('🔢 DEV OTP (for testing):', otpTestResponse.data.devOTP);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Test user not found. Let me create one...');
      await createTestUser();
    } else {
      console.log('❌ Error checking test user:', error.response?.data?.message || error.message);
    }
  }

  // Step 4: Test frontend to backend communication
  console.log('\n4️⃣ Testing frontend API communication...');
  try {
    const corsTest = await axios.post(`${API_BASE_URL}/auth/send-otp-login`,
      { aadhaarNumber: testAadhaar },
      {
        headers: {
          'Origin': FRONTEND_URL,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ CORS and API communication working');
    console.log('   Response code:', corsTest.data.code);
  } catch (error) {
    console.log('❌ Frontend API communication issue');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
  }

  // Step 5: Interactive test
  console.log('\n5️⃣ Interactive OTP test...');
  const shouldTest = await prompt('Do you want to test OTP login interactively? (y/n): ');
  
  if (shouldTest.toLowerCase() === 'y') {
    await interactiveOTPTest();
  }

  // Step 6: Check browser console logs suggestion
  console.log('\n6️⃣ Frontend debugging suggestions:');
  console.log('=====================================');
  console.log('If the backend is working but frontend fails:');
  console.log('1. Open browser developer tools (F12)');
  console.log('2. Go to Network tab');
  console.log('3. Try to send OTP from the frontend');
  console.log('4. Check for failed network requests');
  console.log('5. Look in Console tab for JavaScript errors');
  console.log('');
  console.log('Common issues:');
  console.log('• Network request blocked by CORS');
  console.log('• JavaScript errors in frontend code');
  console.log('• API URL mismatch');
  console.log('• Form validation preventing submission');

  rl.close();
}

async function createTestUser() {
  console.log('Creating test user...');
  
  try {
    // First send registration OTP
    const regOTPResponse = await axios.post(`${API_BASE_URL}/auth/send-otp-registration`, {
      mobileNumber: '8424972423',
      aadhaarNumber: '123456789012'
    });
    
    console.log('✅ Registration OTP sent');
    
    let otp = '123456'; // Default OTP for testing
    if (regOTPResponse.data.devOTP) {
      otp = regOTPResponse.data.devOTP;
      console.log('🔢 Using DEV OTP:', otp);
    }
    
    // Complete registration
    const regResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp-registration`, {
      mobileNumber: '8424972423',
      aadhaarNumber: '123456789012',
      otp: otp,
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      gender: 'Male'
    });
    
    console.log('✅ Test user created successfully');
  } catch (error) {
    console.log('❌ Failed to create test user:', error.response?.data?.message || error.message);
  }
}

async function interactiveOTPTest() {
  const aadhaar = await prompt('Enter Aadhaar number (or press Enter for test user): ');
  const aadhaarNumber = aadhaar || '123456789012';
  
  console.log('\n🔄 Sending OTP...');
  try {
    const otpResponse = await axios.post(`${API_BASE_URL}/auth/send-otp-login`, {
      aadhaarNumber
    });
    
    console.log('✅ OTP sent successfully!');
    console.log('📱 Mobile:', otpResponse.data.mobileNumber);
    console.log('👤 User:', otpResponse.data.fullName);
    
    if (otpResponse.data.devOTP) {
      console.log('🔢 OTP (DEV MODE):', otpResponse.data.devOTP);
      
      const shouldVerify = await prompt('Verify this OTP? (y/n): ');
      if (shouldVerify.toLowerCase() === 'y') {
        try {
          const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp-login`, {
            aadhaarNumber,
            otp: otpResponse.data.devOTP
          });
          
          console.log('✅ OTP verification successful!');
          console.log('🎉 Login completed!');
          console.log('👤 Welcome:', verifyResponse.data.user.fullName);
        } catch (error) {
          console.log('❌ OTP verification failed:', error.response?.data?.message);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Failed to send OTP');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 User not found. Make sure the user is registered first.');
    }
  }
}

// Run the debug tool
debugOTPIssue().catch(console.error);