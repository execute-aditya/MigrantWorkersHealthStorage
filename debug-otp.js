const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugOTP() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check all users and their OTP status
    const users = await User.find({}).select('firstName lastName mobileNumber aadhaarNumber otp isVerified');
    
    console.log('\n👥 User OTP Status:');
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📱 Mobile: ${user.mobileNumber}`);
      console.log(`   🆔 Aadhar: ${user.aadhaarNumber}`);
      console.log(`   ✅ Verified: ${user.isVerified}`);
      
      if (user.otp && user.otp.code) {
        const isExpired = user.otp.expiresAt < new Date();
        const timeLeft = user.otp.expiresAt - new Date();
        const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
        
        console.log(`   🔢 OTP: ${user.otp.code}`);
        console.log(`   ⏰ Expires: ${user.otp.expiresAt.toLocaleString()}`);
        console.log(`   🕐 Status: ${isExpired ? '❌ EXPIRED' : `✅ Valid (${minutesLeft} min left)`}`);
        console.log(`   🔁 Attempts: ${user.otp.attempts || 0}/3`);
      } else {
        console.log(`   🔢 OTP: None active`);
      }
      console.log('');
    });
    
    console.log('\n🔧 Debugging Tips:');
    console.log('1. OTP is valid for 10 minutes from generation');
    console.log('2. Maximum 3 attempts per OTP');
    console.log('3. Check the console output when sending OTP for the actual code');
    console.log('4. Make sure you\'re using the most recent OTP');
    
    console.log('\n💡 Common Issues:');
    console.log('- Using old OTP after requesting new one');
    console.log('- Waiting too long (>10 minutes) to enter OTP');
    console.log('- Exceeding 3 verification attempts');
    console.log('- Server restart clears OTP from memory');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

debugOTP();