const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function setupTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check existing users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\n📝 No users found. Creating a test user...');
      
      // Create a test user
      const testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        mobileNumber: '9876543210', // Indian mobile number format
        aadhaarNumber: '314619230735', // The Aadhar you tried
        email: 'testuser@example.com',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
        bloodGroup: 'B+',
        address: {
          street: '123 Test Street',
          city: 'Kochi',
          district: 'Ernakulam',
          state: 'Kerala',
          pincode: '682001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          mobileNumber: '9876543211'
        },
        isVerified: true, // Mark as verified so login works
        isActive: true
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully!');
      console.log('📱 Mobile: 9876543210');
      console.log('🆔 Aadhar: 314619230735');
      console.log('👤 Name: Test User');
      
    } else {
      console.log('\n👥 Existing users:');
      const users = await User.find({})
        .select('firstName lastName mobileNumber aadhaarNumber isVerified isActive')
        .limit(5);
        
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   📱 Mobile: ${user.mobileNumber}`);
        console.log(`   🆔 Aadhar: ${user.aadhaarNumber}`);
        console.log(`   ✅ Verified: ${user.isVerified ? 'Yes' : 'No'}`);
        console.log(`   🔓 Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
      
      if (userCount > 5) {
        console.log(`   ... and ${userCount - 5} more users`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

setupTestUser();