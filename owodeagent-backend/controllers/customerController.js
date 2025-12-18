const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { sendEmail } = require('../utils/resendEmail');
const { sendSMS } = require('../utils/sendSMS');

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ agentId: req.agent.id });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      agentId: req.agent.id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    // Only super-admin can delete directly
    if (req.agent.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super admin can delete customers directly' });
    }

    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      agentId: req.agent.id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Also delete all payments for this customer
    await require('../models/Payment').deleteMany({ customerId: req.params.id });

    res.json({ message: 'Customer and all associated payments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, dateOfBirth, phone, email, contributionAmount, contributionFrequency } = req.body;

  try {
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // Validate contribution amount is provided and positive
    if (!contributionAmount || contributionAmount <= 0) {
      return res.status(400).json({ message: 'Contribution amount is required and must be greater than 0' });
    }

    const customer = new Customer({
      firstName,
      lastName,
      dateOfBirth,
      phone,
      email,
      contributionAmount: Number(contributionAmount),
      contributionFrequency,
      agentId: req.agent.id,
    });
    await customer.save();

    // Send welcome notifications
    try {
      // Always send SMS welcome message
      const smsMessage = `Welcome ${firstName} ${lastName}! 🎉 Your savings account with Owode Agent has been created. Your contribution plan: ₦${contributionAmount} ${contributionFrequency}. Start building your financial future today!`;
      const smsResult = await sendSMS(phone, smsMessage);
      if (!smsResult.success) {
        console.error('SMS welcome failed:', smsResult.error);
      }

      // Send email welcome message if email is provided
      if (email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin-bottom: 20px; font-size: 28px;">🎉 Welcome to Owode Agent!</h1>
              <p style="color: white; font-size: 18px; margin-bottom: 20px;">Dear ${firstName} ${lastName},</p>
              <p style="color: white; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Your savings account has been successfully created! We're excited to help you build a brighter financial future.
              </p>
              <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: white; margin-bottom: 10px;">Your Contribution Plan:</h3>
                <p style="color: white; font-size: 20px; font-weight: bold;">₦${contributionAmount} per ${contributionFrequency}</p>
              </div>
              <p style="color: white; font-size: 16px; line-height: 1.6;">
                Start your journey towards financial freedom today. Your agent will be in touch soon with more details.
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
                <p style="color: rgba(255,255,255,0.8); font-size: 14px;">Best regards,<br>The Owode Agent Team</p>
              </div>
            </div>
          </div>
        `;
        const emailResult = await sendEmail(email, '🎉 Welcome to Owode Agent - Your Account is Ready!', emailHtml);
        if (!emailResult.success) {
          console.error('Email welcome failed:', emailResult.error);
        }
      }
    } catch (notificationError) {
      console.error('Welcome notification failed:', notificationError);
      // Don't fail the customer creation if notifications fail
    }

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const requestDeletion = async (req, res) => {
  const { customerId, reason } = req.body;

  try {
    const customer = await Customer.findById(customerId).populate('agentId', 'firstName lastName email');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if customer belongs to the requesting agent
    if (customer.agentId._id.toString() !== req.agent.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if deletion already requested
    if (customer.deletionRequested) {
      return res.status(400).json({ message: 'Deletion already requested for this customer' });
    }

    customer.deletionRequested = true;
    customer.deletionRequestDate = new Date();
    customer.deletionReason = reason || 'No reason provided';
    await customer.save();

    // Send email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Customer Deletion Request</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .tagline { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .customer-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; margin: 20px 0; }
          .customer-name { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
          .customer-detail { margin: 8px 0; font-size: 16px; }
          .reason-card { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .agent-info { background: #e8f5e8; border: 1px solid #c3e6cb; padding: 15px; border-radius: 10px; margin: 15px 0; }
          .action-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Owode Agent</div>
            <div class="tagline">Customer Deletion Request</div>
          </div>

          <div class="content">
            <h1 class="title">🗑️ Customer Deletion Request</h1>
            <p>An agent has requested to delete a customer account. Please review and approve or deny this request.</p>

            <div class="customer-card">
              <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin: 15px 0;">
                <div class="customer-detail">📧 Email: ${customer.email || 'N/A'}</div>
                <div class="customer-detail">📱 Phone: ${customer.phone}</div>
                <div class="customer-detail">💰 Balance: ₦${customer.balance || 0}</div>
                <div class="customer-detail">🆔 Customer ID: ${customer._id}</div>
              </div>
            </div>

            <div class="reason-card">
              <h3 style="color: #856404; margin-bottom: 10px;">Reason for Deletion:</h3>
              <p style="color: #856404; margin: 0;">${customer.deletionReason}</p>
            </div>

            <div class="agent-info">
              <h4 style="color: #155724; margin-bottom: 10px;">Requesting Agent:</h4>
              <p style="color: #155724; margin: 0;"><strong>${customer.agentId.firstName} ${customer.agentId.lastName}</strong> (${customer.agentId.email})</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5000/customers/approve-deletion/${customer._id}" class="action-btn">Approve Deletion</a>
              <a href="http://localhost:5000/customers/deny-deletion/${customer._id}" class="action-btn" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);">Deny Deletion</a>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated notification from the Owode Agent Management System</p>
            <p>© 2024 Owode Agent. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `🗑️ Customer Deletion Request - ${customer.firstName} ${customer.lastName}`,
      adminEmailHtml
    );

    res.json({ message: 'Deletion request submitted successfully' });
  } catch (error) {
    console.error('Customer deletion request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveDeletion = async (req, res) => {
  const { customerId, approved } = req.body;

  try {
    const customer = await Customer.findById(customerId).populate('agentId', 'firstName lastName email');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (!customer.deletionRequested) {
      return res.status(400).json({ message: 'No deletion request found for this customer' });
    }

    if (approved) {
      // Delete the customer
      await Customer.findByIdAndDelete(customerId);

      // Send confirmation email to agent
      const approvalEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Customer Deletion Approved</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 30px; text-align: center; }
            .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
            .success-icon { font-size: 48px; margin-bottom: 15px; }
            .message { font-size: 16px; color: #666; line-height: 1.6; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Owode Agent</div>
              <div class="tagline">Customer Deletion Approved</div>
            </div>

            <div class="content">
              <div class="success-icon">✅</div>
              <h1 class="title">Customer Deletion Approved</h1>
              <p class="message">
                The customer <strong>${customer.firstName} ${customer.lastName}</strong> has been successfully deleted from the system.
              </p>
            </div>

            <div class="footer">
              <p>This is an automated notification from the Owode Agent Management System</p>
              <p>© 2024 Owode Agent. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        customer.agentId.email,
        '✅ Customer Deletion Approved',
        approvalEmailHtml
      );

      res.json({ message: 'Customer deleted successfully' });
    } else {
      // Deny deletion - reset the request
      customer.deletionRequested = false;
      customer.deletionRequestDate = null;
      customer.deletionReason = null;
      await customer.save();

      // Send denial email to agent
      const denialEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Customer Deletion Denied</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 30px; text-align: center; }
            .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
            .warning-icon { font-size: 48px; margin-bottom: 15px; }
            .message { font-size: 16px; color: #666; line-height: 1.6; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Owode Agent</div>
              <div class="tagline">Customer Deletion Denied</div>
            </div>

            <div class="content">
              <div class="warning-icon">❌</div>
              <h1 class="title">Customer Deletion Denied</h1>
              <p class="message">
                Your request to delete the customer <strong>${customer.firstName} ${customer.lastName}</strong> has been denied by the administrator.
                The customer account remains active.
              </p>
            </div>

            <div class="footer">
              <p>This is an automated notification from the Owode Agent Management System</p>
              <p>© 2024 Owode Agent. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        customer.agentId.email,
        '❌ Customer Deletion Denied',
        denialEmailHtml
      );

      res.json({ message: 'Customer deletion denied' });
    }
  } catch (error) {
    console.error('Customer deletion approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingDeletions = async (req, res) => {
  try {
    const pendingDeletions = await Customer.find({ deletionRequested: true })
      .populate('agentId', 'firstName lastName email')
      .select('firstName lastName email phone balance deletionReason deletionRequestDate agentId');
    res.json(pendingDeletions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    // Only super-admin can view all customers
    if (req.agent.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allCustomers = await Customer.find({}).populate('agentId', 'firstName lastName email');
    res.json(allCustomers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCustomers, getCustomerById, createCustomer, deleteCustomer, requestDeletion, approveDeletion, getPendingDeletions, getAllCustomers };