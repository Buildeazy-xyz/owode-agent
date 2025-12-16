const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const { sendEmail } = require('../utils/resendEmail');
const { sendSMS } = require('../utils/sendSMS');

const addPayment = async (customerId, agentId, amount, notifyType, paymentDate = null) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Update balance
  customer.balance += amount;
  await customer.save();

  // Create payment record
  const paymentData = {
    customerId,
    agentId,
    amount,
    notifyType,
  };

  // If payment date is provided, set the createdAt to that date
  if (paymentDate) {
    paymentData.createdAt = new Date(paymentDate);
  }

  const payment = new Payment(paymentData);
  await payment.save();

  // Send notification
  if (notifyType === 'sms') {
    const message = `Dear ${customer.firstName} ${customer.lastName}, you have made a payment of ₦${amount}. Your new balance is ₦${customer.balance}. Contribution frequency: ${customer.contributionFrequency}.`;
    const smsResult = await sendSMS(customer.phone, message);
    if (!smsResult.success) {
      console.error('Payment SMS failed:', smsResult.error);
    }
  } else if (notifyType === 'email') {
    if (!customer.email) {
      throw new Error('Customer has no email');
    }

    const paymentEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation - Owode Agent</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .tagline { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .payment-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin: 20px 0; text-align: center; }
          .amount { font-size: 32px; font-weight: bold; margin: 15px 0; }
          .payment-details { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .balance-highlight { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 15px; margin: 20px 0; text-align: center; }
          .balance-amount { font-size: 28px; font-weight: bold; margin: 10px 0; }
          .next-payment { background: #e3f2fd; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2196F3; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
          .success-icon { font-size: 48px; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Owode Agent</div>
            <div class="tagline">Payment Confirmation</div>
          </div>

          <div class="content">
            <h1 class="title">💰 Payment Successfully Recorded</h1>

            <div class="payment-card">
              <div class="success-icon">✅</div>
              <div>Dear ${customer.firstName} ${customer.lastName},</div>
              <div>Your payment has been successfully processed!</div>
              <div class="amount">₦${amount.toLocaleString()}</div>
            </div>

            <div class="payment-details">
              <h3 style="margin-top: 0; color: white;">Payment Details</h3>
              <div class="detail-row">
                <span>Amount Paid:</span>
                <strong>₦${amount.toLocaleString()}</strong>
              </div>
              <div class="detail-row">
                <span>Contribution Frequency:</span>
                <strong>${customer.contributionFrequency}</strong>
              </div>
              <div class="detail-row">
                <span>Transaction Date:</span>
                <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            </div>

            <div class="balance-highlight">
              <div>Your Updated Account Balance</div>
              <div class="balance-amount">₦${customer.balance.toLocaleString()}</div>
              <div>Keep up the great work with your savings journey!</div>
            </div>

            <div class="next-payment">
              <strong>Next Payment Reminder:</strong><br>
              Continue your ${customer.contributionFrequency} contribution schedule to maintain your progress.
            </div>

            <p style="text-align: center; color: #666; margin-top: 30px;">
              Thank you for choosing Owodealajo Agbaye for your financial management needs.
            </p>
          </div>

          <div class="footer">
            <p>This is an automated payment confirmation from the Owode Agent Management System</p>
            <p>© 2024 Owode Agent. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(customer.email, '💰 Payment Confirmation - Owode Agent', paymentEmailHtml);
  }

  return { payment, customer };
};

module.exports = { addPayment };