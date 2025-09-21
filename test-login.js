const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BASE_URL = 'http://localhost:5000/api/auth';

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function testLogin() {
  try {
    console.log('🚀 Kerala Migrant Health Storage - Login Test\n');
    
    // Step 1: Check system configuration
    console.log('1️⃣ Checking system configuration...');
    try {
      const configResponse = await axios.get(`${BASE_URL}/config-check`);
      console.log('✅ Configuration Status:', configResponse.data.status);
      
      if (configResponse.data.status !== 'ready') {
        console.log('⚠️ System needs configuration:');
        console.log(configResponse.data.recommendations);
        console.log('Please fix configuration issues before testing login.\n');
        return;
      }
    } catch (error) {
      console.log('❌ Could not check configuration. Make sure server is running.');
      console.log('Error:', error.message);
      return;
    }

    // Step 2: Get Aadhar number from user
    const aadhaarNumber = await prompt('Enter Aadhar number (12 digits): ');
    
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      console.log('❌ Invalid Aadhar number. Must be 12 digits.');
      return;
    }

    // Step 3: Send OTP
    console.log('\n2️⃣ Sending OTP...');
    try {
      const otpResponse = await axios.post(`${BASE_URL}/send-otp-login`, {
        aadhaarNumber
      });
      
      console.log('✅', otpResponse.data.message);
      console.log('📱 Mobile Number:', otpResponse.data.mobileNumber);
      console.log('👤 User:', otpResponse.data.fullName);
      console.log('⏰ Expires in:', otpResponse.data.expiresIn);
      
    } catch (error) {
      if (error.response) {
        console.log('❌', error.response.data.message);
        if (error.response.data.code) {
          console.log('🏷️ Error Code:', error.response.data.code);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
      return;
    }

    // Step 4: Get OTP from user
    const otp = await prompt('\nEnter the 6-digit OTP received on your mobile: ');
    
    if (!/^\d{6}$/.test(otp)) {
      console.log('❌ Invalid OTP. Must be 6 digits.');
      return;
    }

    // Step 5: Verify OTP and login
    console.log('\n3️⃣ Verifying OTP and logging in...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/verify-otp-login`, {
        aadhaarNumber,
        otp
      });
      
      console.log('✅', loginResponse.data.message);
      console.log('🎉 Login successful!');
      console.log('\n👤 User Information:');
      console.log('   - Name:', loginResponse.data.user.fullName);
      console.log('   - Mobile:', loginResponse.data.user.mobileNumber);
      console.log('   - Aadhar:', loginResponse.data.user.aadhaarNumber);
      console.log('   - Blood Group:', loginResponse.data.user.bloodGroup || 'Not specified');
      console.log('   - Last Login:', new Date(loginResponse.data.user.lastLogin).toLocaleString());
      console.log('\n🔑 JWT Token generated (first 50 chars):', loginResponse.data.token.substring(0, 50) + '...');
      
    } catch (error) {
      if (error.response) {
        console.log('❌', error.response.data.message);
        if (error.response.data.code) {
          console.log('🏷️ Error Code:', error.response.data.code);
        }
        if (error.response.data.remainingAttempts !== undefined) {
          console.log('🔢 Remaining Attempts:', error.response.data.remainingAttempts);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
      return;
    }

    console.log('\n✅ Login test completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/api/health-check');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:5000');
    console.log('Please start the server first with: npm start');
    process.exit(1);
  }
  
  await testLogin();
}

main();