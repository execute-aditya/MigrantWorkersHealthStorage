const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Simulate frontend API calls
const API_BASE_URL = 'http://localhost:5000/api';
const CLIENT_PORT = 3001; // The port where frontend is running

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function debugFrontendOTP() {
  try {
    console.log('🔍 Frontend OTP Debug Tool');
    console.log('==========================\n');
    
    // Test 1: Check if backend is accessible from frontend
    console.log('1️⃣ Testing backend connectivity...');
    try {
      const healthCheck = await axios.get(`${API_BASE_URL}/health-check`, {
        headers: {
          'Origin': `http://localhost:${CLIENT_PORT}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Backend is accessible:', healthCheck.data.message);
    } catch (error) {
      console.log('❌ Backend connectivity issue:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
      return;
    }

    // Test 2: CORS preflight check
    console.log('\n2️⃣ Testing CORS configuration...');
    try {
      const corsCheck = await axios.options(`${API_BASE_URL}/auth/send-otp-login`, {
        headers: {
          'Origin': `http://localhost:${CLIENT_PORT}`,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });
      console.log('✅ CORS preflight successful');
    } catch (error) {
      console.log('❌ CORS issue detected:', error.message);
      return;
    }

    // Test 3: System configuration
    console.log('\n3️⃣ Checking system configuration...');
    try {
      const configResponse = await axios.get(`${API_BASE_URL}/auth/config-check`, {
        headers: {
          'Origin': `http://localhost:${CLIENT_PORT}`
        }
      });
      console.log('✅ System status:', configResponse.data.status);
      
      if (configResponse.data.status !== 'ready') {
        console.log('⚠️ Configuration issues:');
        console.log(configResponse.data.recommendations);
        return;
      }
    } catch (error) {
      console.log('❌ Config check failed:', error.message);
      return;
    }

    // Test 4: User input and OTP request
    const aadhaarNumber = await prompt('\n4️⃣ Enter Aadhar number to test OTP (12 digits): ');
    
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      console.log('❌ Invalid Aadhar number format');
      return;
    }

    console.log('\n5️⃣ Testing OTP request (simulating frontend call)...');
    try {
      const otpResponse = await axios.post(`${API_BASE_URL}/auth/send-otp-login`, 
        {
          aadhaarNumber: aadhaarNumber
        },
        {
          headers: {
            'Origin': `http://localhost:${CLIENT_PORT}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ OTP request successful!');
      console.log('📱 Mobile:', otpResponse.data.mobileNumber);
      console.log('👤 User:', otpResponse.data.fullName);
      console.log('⏰ Expires:', otpResponse.data.expiresIn);
      console.log('🏷️ Code:', otpResponse.data.code);
      
      if (otpResponse.data.devOTP) {
        console.log('🔢 DEV OTP:', otpResponse.data.devOTP);
      }
      
    } catch (error) {
      console.log('❌ OTP request failed!');
      console.log('Error details:');
      
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        console.log('   Code:', error.response.data.code);
        console.log('   Full response:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log('   No response received from server');
        console.log('   Request details:', error.request);
      } else {
        console.log('   Setup error:', error.message);
      }
      
      return;
    }

    // Test 6: Network timing analysis
    console.log('\n6️⃣ Network timing analysis...');
    const startTime = Date.now();
    
    try {
      await axios.get(`${API_BASE_URL}/health-check`, {
        headers: {
          'Origin': `http://localhost:${CLIENT_PORT}`
        }
      });
      const endTime = Date.now();
      console.log(`✅ Network latency: ${endTime - startTime}ms`);
    } catch (error) {
      console.log('❌ Network timing test failed');
    }

    console.log('\n🎯 Debug Summary:');
    console.log('================');
    console.log('If OTP request succeeded:');
    console.log('  • Backend is working correctly');
    console.log('  • Issue might be in frontend JavaScript code');
    console.log('  • Check browser developer tools for client-side errors');
    console.log('  • Verify API service configuration in client');
    console.log('');
    console.log('If OTP request failed:');
    console.log('  • Check the error details above');
    console.log('  • Verify user exists in database');
    console.log('  • Check Twilio configuration');
    console.log('  • Verify server is running on port 5000');

    const testOTPVerification = await prompt('\nDo you want to test OTP verification as well? (y/n): ');
    
    if (testOTPVerification.toLowerCase() === 'y') {
      const otp = await prompt('Enter the OTP you received: ');
      
      if (!/^\d{6}$/.test(otp)) {
        console.log('❌ Invalid OTP format');
        return;
      }
      
      console.log('\n7️⃣ Testing OTP verification...');
      try {
        const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-otp-login`,
          {
            aadhaarNumber: aadhaarNumber,
            otp: otp
          },
          {
            headers: {
              'Origin': `http://localhost:${CLIENT_PORT}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ OTP verification successful!');
        console.log('🎉 Login completed');
        console.log('👤 Welcome:', verifyResponse.data.user.fullName);
        console.log('🔑 Token generated successfully');
        
      } catch (error) {
        console.log('❌ OTP verification failed');
        if (error.response) {
          console.log('   Message:', error.response.data.message);
          console.log('   Code:', error.response.data.code);
          if (error.response.data.remainingAttempts !== undefined) {
            console.log('   Remaining attempts:', error.response.data.remainingAttempts);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

// Check if servers are running
async function checkServers() {
  console.log('Checking servers...\n');
  
  // Check backend
  try {
    await axios.get('http://localhost:5000/api/health-check');
    console.log('✅ Backend server (port 5000): Running');
  } catch {
    console.log('❌ Backend server (port 5000): Not running');
    console.log('   Please start with: cd /path/to/project && node server.js');
    return false;
  }
  
  // Check frontend
  try {
    await axios.get(`http://localhost:${CLIENT_PORT}`);
    console.log(`✅ Frontend server (port ${CLIENT_PORT}): Running`);
  } catch {
    console.log(`❌ Frontend server (port ${CLIENT_PORT}): Not running`);
    console.log('   Please start with: cd /path/to/project/client && PORT=3001 npm start');
    return false;
  }
  
  return true;
}

async function main() {
  const serversRunning = await checkServers();
  
  if (!serversRunning) {
    console.log('\nPlease ensure both servers are running before debugging.');
    process.exit(1);
  }
  
  console.log('');
  await debugFrontendOTP();
}

main();