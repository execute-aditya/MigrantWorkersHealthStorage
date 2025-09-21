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

async function completeRegistration() {
  try {
    console.log('🚀 Kerala Migrant Health Storage - Complete Registration\n');
    
    // Step 1: Get registration details
    console.log('📝 Please provide registration details:');
    const mobileNumber = await prompt('Mobile Number (10 digits): ');
    const aadhaarNumber = await prompt('Aadhar Number (12 digits): ');
    
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      console.log('❌ Invalid mobile number. Must be 10 digits starting with 6-9.');
      return;
    }
    
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      console.log('❌ Invalid Aadhar number. Must be 12 digits.');
      return;
    }

    // Step 2: Send OTP for registration
    console.log('\n1️⃣ Sending OTP for registration...');
    try {
      const otpResponse = await axios.post(`${BASE_URL}/send-otp-registration`, {
        mobileNumber,
        aadhaarNumber
      });
      
      console.log('✅', otpResponse.data.message);
      console.log('📱 OTP sent to:', otpResponse.data.mobileNumber);
      
    } catch (error) {
      if (error.response && error.response.data.message.includes('already exists')) {
        console.log('👤 User already exists! Proceeding to complete registration...');
      } else {
        console.log('❌', error.response?.data?.message || error.message);
        return;
      }
    }

    // Step 3: Get personal details
    console.log('\n2️⃣ Personal Information:');
    const firstName = await prompt('First Name: ');
    const lastName = await prompt('Last Name: ');
    const dateOfBirth = await prompt('Date of Birth (YYYY-MM-DD): ');
    const gender = await prompt('Gender (Male/Female/Other): ');
    const email = await prompt('Email (optional): ');
    const bloodGroup = await prompt('Blood Group (A+/A-/B+/B-/AB+/AB-/O+/O-): ');

    // Step 4: Get address details
    console.log('\n3️⃣ Address Information:');
    const street = await prompt('Street Address: ');
    const city = await prompt('City: ');
    const district = await prompt('District: ');
    const pincode = await prompt('Pincode: ');

    // Step 5: Get emergency contact
    console.log('\n4️⃣ Emergency Contact:');
    const emergencyName = await prompt('Emergency Contact Name: ');
    const emergencyRelation = await prompt('Relationship: ');
    const emergencyMobile = await prompt('Emergency Contact Mobile: ');

    // Step 6: Get OTP
    const otp = await prompt('\n5️⃣ Enter the 6-digit OTP received: ');
    
    if (!/^\d{6}$/.test(otp)) {
      console.log('❌ Invalid OTP. Must be 6 digits.');
      return;
    }

    // Step 7: Complete registration
    console.log('\n6️⃣ Completing registration...');
    try {
      const registrationData = {
        mobileNumber,
        otp,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        address: {
          street,
          city,
          district,
          state: 'Kerala',
          pincode,
          country: 'India'
        },
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRelation,
          mobileNumber: emergencyMobile
        }
      };

      // Add optional fields
      if (email) registrationData.email = email;
      if (bloodGroup) registrationData.bloodGroup = bloodGroup;

      const registerResponse = await axios.post(`${BASE_URL}/verify-otp-registration`, registrationData);
      
      console.log('✅', registerResponse.data.message);
      console.log('🎉 Registration completed successfully!');
      console.log('\n👤 User Information:');
      console.log('   - Name:', registerResponse.data.user.firstName, registerResponse.data.user.lastName);
      console.log('   - Mobile:', registerResponse.data.user.mobileNumber);
      console.log('   - Verified:', registerResponse.data.user.isVerified ? 'Yes' : 'No');
      console.log('\n🔑 JWT Token generated (first 50 chars):', registerResponse.data.token.substring(0, 50) + '...');
      
    } catch (error) {
      if (error.response) {
        console.log('❌', error.response.data.message);
        if (error.response.data.errors) {
          console.log('Validation errors:');
          error.response.data.errors.forEach(err => {
            console.log('  -', err.msg);
          });
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
      return;
    }

    console.log('\n✅ Registration completed! You can now login using:');
    console.log(`   - Aadhar: ${aadhaarNumber}`);
    console.log(`   - Mobile: ${mobileNumber}`);
    
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
  
  await completeRegistration();
}

main();