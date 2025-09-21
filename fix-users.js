const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to fix`);
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n🔧 Fixing user ${i + 1}:`);
      console.log(`   📱 Mobile: ${user.mobileNumber}`);
      console.log(`   🆔 Aadhar: ${user.aadhaarNumber}`);
      
      // Fix missing data
      if (!user.firstName) {
        user.firstName = 'Test';
      }
      if (!user.lastName) {
        user.lastName = 'User' + (i + 1);
      }
      if (!user.dateOfBirth) {
        user.dateOfBirth = new Date('1990-01-01');
      }
      if (!user.gender) {
        user.gender = 'Male';
      }
      
      // Mark as verified so they can login
      user.isVerified = true;
      user.isActive = true;
      
      await user.save();
      console.log(`   ✅ Fixed: ${user.firstName} ${user.lastName}`);
    }
    
    console.log('\n🎉 All users fixed! You can now test login with any of these Aadhar numbers:');
    const fixedUsers = await User.find({}).select('firstName lastName mobileNumber aadhaarNumber');
    
    fixedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📱 Mobile: ${user.mobileNumber}`);
      console.log(`   🆔 Aadhar: ${user.aadhaarNumber}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

fixUsers();