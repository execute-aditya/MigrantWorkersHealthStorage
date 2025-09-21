const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function manageUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check all users and their status
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in database\n`);
    
    let completeUsers = 0;
    let incompleteUsers = 0;
    
    console.log('👥 User Status Report:');
    console.log('='.repeat(80));
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const isComplete = user.firstName && user.lastName && user.dateOfBirth && user.gender;
      
      console.log(`${i + 1}. Mobile: ${user.mobileNumber} | Aadhar: ${user.aadhaarNumber}`);
      console.log(`   Name: ${user.firstName || 'Missing'} ${user.lastName || 'Missing'}`);
      console.log(`   Status: ${isComplete ? '✅ Complete' : '⚠️  Incomplete'} | Verified: ${user.isVerified ? '✅' : '❌'}`);
      console.log(`   Created: ${user.createdAt ? user.createdAt.toLocaleDateString() : 'Unknown'}`);
      console.log('');
      
      if (isComplete) {
        completeUsers++;
      } else {
        incompleteUsers++;
      }
    }
    
    console.log('📈 Summary:');
    console.log(`   Complete Users: ${completeUsers}`);
    console.log(`   Incomplete Users: ${incompleteUsers}`);
    console.log(`   Total Users: ${users.length}`);
    
    if (incompleteUsers > 0) {
      console.log('\n🔧 Options:');
      console.log('1. Run complete-registration.js to complete registration for existing users');
      console.log('2. Delete incomplete users and start fresh');
      console.log('3. Keep incomplete users (they can complete registration later)');
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('\nWhat would you like to do? (1/2/3): ', (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });
      
      if (answer === '2') {
        console.log('\n🗑️ Deleting incomplete users...');
        const deleteResult = await User.deleteMany({
          $or: [
            { firstName: { $exists: false } },
            { lastName: { $exists: false } },
            { dateOfBirth: { $exists: false } },
            { gender: { $exists: false } }
          ]
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} incomplete users`);
        
        const remainingUsers = await User.countDocuments();
        console.log(`📊 Remaining users: ${remainingUsers}`);
      } else if (answer === '1') {
        console.log('\n📋 To complete registration, run: node complete-registration.js');
        console.log('Use one of these existing mobile/Aadhar combinations:');
        users.forEach((user, index) => {
          if (!user.firstName || !user.lastName) {
            console.log(`   ${index + 1}. Mobile: ${user.mobileNumber} | Aadhar: ${user.aadhaarNumber}`);
          }
        });
      } else {
        console.log('\n📝 Incomplete users will remain in the database.');
        console.log('They can complete registration later using: node complete-registration.js');
      }
    } else {
      console.log('\n🎉 All users have complete registrations!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

manageUsers();