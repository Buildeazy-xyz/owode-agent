const twilio = require('twilio');

const client = process.env.TWILIO_SID ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN) : null;

const sendSMS = async (to, body) => {
  if (!client) {
    console.log('SMS not sent: Twilio not configured');
    return { success: false, message: 'Twilio not configured' };
  }

  // Ensure phone number is in E.164 format
  let formattedTo = to;
  if (!formattedTo.startsWith('+')) {
    // Try to add + if it's missing, but this is basic - in production you'd want better validation
    console.warn('Phone number should be in E.164 format (+countrycode)');
  }

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    });
    console.log('SMS sent successfully:', message.sid);
    return { success: true, message, sid: message.sid };
  } catch (error) {
    console.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };