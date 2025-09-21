const twilio = require('twilio');

// Basic env checks and Twilio client init
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  TWILIO_MESSAGING_SERVICE_SID
} = process.env;

const missing = [];
if (!TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
if (!TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
if (!TWILIO_PHONE_NUMBER && !TWILIO_MESSAGING_SERVICE_SID) missing.push('TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID');

let client = null;
if (!missing.length) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
} else {
  console.error('Twilio config missing:', missing.join(', '));
}

const buildCreateOptions = (to, body) => {
  const opts = { to, body };
  if (TWILIO_MESSAGING_SERVICE_SID) {
    opts.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  } else if (TWILIO_PHONE_NUMBER) {
    opts.from = TWILIO_PHONE_NUMBER;
  }
  return opts;
};

const normalizeIndian = (mobileNumber) => {
  // Keep as E.164, add +91 if a 10-digit local mobile is provided
  if (/^\+\d{10,15}$/.test(mobileNumber)) return mobileNumber; // already E.164
  if (/^[6-9]\d{9}$/.test(mobileNumber)) return `+91${mobileNumber}`;
  return mobileNumber; // let Twilio validate, will error if bad
};

// Common sender
const sendMessage = async (to, body) => {
  if (!client) {
    return { success: false, error: { message: 'Twilio not configured', code: 'CONFIG_MISSING' } };
  }
  try {
    const msg = await client.messages.create(buildCreateOptions(to, body));
    console.log(`SMS sent. SID: ${msg.sid}`);
    return { success: true, messageSid: msg.sid };
  } catch (error) {
    // Surface structured Twilio error details for easier debugging
    const err = {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    };
    console.error('Twilio SMS error:', err);
    return { success: false, error: err };
  }
};

// Send OTP via SMS
const sendOTP = async (mobileNumber, otp) => {
  const to = normalizeIndian(mobileNumber);
  const body = `Your OTP for Kerala Migrant Health Storage registration is: ${otp}. Valid for 10 minutes.`;
  return sendMessage(to, body);
};

// Send login OTP via SMS
const sendLoginOTP = async (mobileNumber, otp) => {
  const to = normalizeIndian(mobileNumber);
  const body = `Your OTP for Kerala Migrant Health Storage login is: ${otp}. Valid for 10 minutes.`;
  return sendMessage(to, body);
};

module.exports = { sendOTP, sendLoginOTP };
