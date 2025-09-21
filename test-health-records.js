const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Try both ports
const POSSIBLE_PORTS = [5000, 5001];
let BASE_URL = null;

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function findServerPort() {
  for (const port of POSSIBLE_PORTS) {
    try {
      const response = await axios.get(`http://localhost:${port}/api/health-check`, { timeout: 2000 });
      if (response.status === 200) {
        BASE_URL = `http://localhost:${port}`;
        console.log(`✅ Server found on port ${port}`);
        return true;
      }
    } catch (error) {
      // Continue to next port
    }
  }
  return false;
}

async function testHealthRecords() {
  try {
    console.log('🔍 Finding server...');
    const serverFound = await findServerPort();
    
    if (!serverFound) {
      console.log('❌ Server not found on ports 5000 or 5001');
      console.log('Please start the server first with: npm start');
      return;
    }
    
    console.log('🏥 Kerala Migrant Health Storage - Health Records Test\n');
    
    // Step 1: Login to get token
    console.log('1️⃣ Getting authentication token...');
    const aadhaarNumber = await prompt('Enter Aadhar number (123456789012): ') || '123456789012';
    
    // Send OTP
    try {
      const otpResponse = await axios.post(`${BASE_URL}/api/auth/send-otp-login`, {
        aadhaarNumber
      });
      console.log('✅ OTP sent to:', otpResponse.data.mobileNumber);
    } catch (error) {
      console.log('❌ Failed to send OTP:', error.response?.data?.message || error.message);
      return;
    }
    
    // Get OTP from user
    const otp = await prompt('Enter the 6-digit OTP: ');
    
    let token;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp-login`, {
        aadhaarNumber,
        otp
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful!');
      console.log('👤 User:', loginResponse.data.user.fullName);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      return;
    }
    
    // Step 2: Test health records endpoints
    console.log('\n2️⃣ Testing health records endpoints...');
    
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      // Get all health records
      const recordsResponse = await axios.get(`${BASE_URL}/api/health/records`, { headers });
      console.log('✅ Health records retrieved successfully!');
      console.log(`📊 Found ${recordsResponse.data.records.length} health records`);
      
      if (recordsResponse.data.records.length > 0) {
        console.log('\n📋 Health Records:');
        recordsResponse.data.records.forEach((record, index) => {
          console.log(`${index + 1}. Date: ${new Date(record.checkupDate).toDateString()}`);
          console.log(`   Type: ${record.checkupType}`);
          console.log(`   Doctor: ${record.doctor?.name || 'Not specified'}`);
          console.log(`   Status: ${record.status}`);
          console.log(`   ID: ${record._id}`);
          console.log('');
        });
        
        // Test viewing a specific record
        const recordId = recordsResponse.data.records[0]._id;
        console.log(`3️⃣ Testing view record functionality for ID: ${recordId}`);
        
        try {
          const viewResponse = await axios.get(`${BASE_URL}/api/health/records/${recordId}`, { headers });
          console.log('✅ Record view successful!');
          
          const record = viewResponse.data.record;
          console.log('\n🔍 Record Details:');
          console.log(`   Date: ${new Date(record.checkupDate).toDateString()}`);
          console.log(`   Type: ${record.checkupType}`);
          console.log(`   Doctor: ${record.doctor?.name} (${record.doctor?.specialization})`);
          console.log(`   Hospital: ${record.doctor?.hospital}`);
          console.log(`   Diagnosis: ${record.diagnosis?.[0]?.condition || 'None specified'}`);
          console.log(`   Status: ${record.diagnosis?.[0]?.status || record.status}`);
          console.log(`   Notes: ${record.notes || 'No notes'}`);
          
          if (record.vitals) {
            console.log('\n💓 Vital Signs:');
            if (record.vitals.bloodPressure?.systolic) {
              console.log(`   Blood Pressure: ${record.vitals.bloodPressure.systolic}/${record.vitals.bloodPressure.diastolic} mmHg`);
            }
            if (record.vitals.heartRate?.value) {
              console.log(`   Heart Rate: ${record.vitals.heartRate.value} bpm`);
            }
            if (record.vitals.temperature?.value) {
              console.log(`   Temperature: ${record.vitals.temperature.value}°C`);
            }
            if (record.vitals.weight?.value) {
              console.log(`   Weight: ${record.vitals.weight.value} kg`);
            }
          }
          
          console.log('\n🎉 View functionality is working correctly!');
          console.log('The frontend should be able to display this data when the view button is clicked.');
          
        } catch (error) {
          console.log('❌ Failed to view record:', error.response?.data?.message || error.message);
        }
        
      } else {
        console.log('⚠️ No health records found for this user');
      }
      
    } catch (error) {
      console.log('❌ Failed to get health records:', error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        console.log('🔒 Authentication failed. Token may be invalid.');
      }
    }
    
    console.log('\n✅ Health records API test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

testHealthRecords();