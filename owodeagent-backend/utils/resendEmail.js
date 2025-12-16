const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = process.env.MAILGUN_API_KEY ? new Mailgun(formData).client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
}) : null;

const sendEmail = async (to, subject, html) => {
  if (!mailgun) {
    console.log('Email not sent: Mailgun not configured');
    return { success: false, message: 'Mailgun not configured' };
  }
  try {
    const data = await mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Owode Agent <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', data.id);
    return { success: true, data, id: data.id };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };