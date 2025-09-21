const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('../models/User');

async function main() {
  const {
    MONGODB_URI,
    AADHAAR = '123456789012',
    MOBILE = '9876543210',
    FIRST_NAME = 'Demo',
    LAST_NAME = 'User',
    DOB = '1990-01-01',
    GENDER = 'Male',
  } = process.env;

  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB');

  const aadhaarNumber = AADHAAR;
  const mobileNumber = MOBILE;

  const update = {
    firstName: FIRST_NAME,
    lastName: LAST_NAME,
    mobileNumber,
    aadhaarNumber,
    dateOfBirth: new Date(DOB),
    gender: GENDER,
    isVerified: true,
    isActive: true,
    lastLogin: new Date(),
    otp: undefined,
    loginAttempts: 0,
  };

  const user = await User.findOneAndUpdate(
    { aadhaarNumber },
    { $set: update },
    { upsert: true, new: true }
  );

  console.log('Seeded user:');
  console.log({
    id: user._id.toString(),
    fullName: `${user.firstName} ${user.lastName}`,
    mobileNumber: user.mobileNumber,
    aadhaarNumber: user.aadhaarNumber,
  });

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});