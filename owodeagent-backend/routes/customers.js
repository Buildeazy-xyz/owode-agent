const express = require('express');
const { body } = require('express-validator');
const { getCustomers, getCustomerById, createCustomer, deleteCustomer, requestDeletion, approveDeletion, getPendingDeletions, getAllCustomers, getCustomersByAgent } = require('../controllers/customerController');
const auth = require('../middleware/auth');
const agentApproved = require('../middleware/agentApproved');

const router = express.Router();

router.get('/list', auth, agentApproved, getCustomers);

router.get('/:id', auth, agentApproved, getCustomerById);

router.post('/create', [
  auth,
  agentApproved,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
    .matches(/^(\+?[1-9]\d{1,14}|\d{10,15})$/).withMessage('Phone number must be valid (e.g., +1234567890 or 1234567890)'),
  body('contributionAmount').isNumeric().withMessage('Contribution amount must be a number')
    .isFloat({ min: 1 }).withMessage('Contribution amount must be greater than 0'),
], createCustomer);

router.post('/request-deletion', [
  auth,
  agentApproved,
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
], requestDeletion);

router.post('/approve-deletion', approveDeletion); // Admin route, no auth for now

router.get('/approve-deletion/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const Customer = require('../models/Customer');
    const { sendEmail } = require('../utils/resendEmail');

    const customer = await Customer.findById(customerId).populate('agentId', 'firstName lastName email');
    if (!customer) {
      return res.status(404).send('<h1>Customer not found</h1>');
    }

    if (!customer.deletionRequested) {
      return res.status(400).send('<h1>No deletion request found for this customer</h1>');
    }

    // Approve deletion
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

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Customer Deletion Approved</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .container { max-width: 600px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; padding: 40px; }
          .success-icon { font-size: 64px; margin-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .message { font-size: 18px; color: #666; line-height: 1.6; margin-bottom: 30px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1 class="title">Customer Deletion Approved</h1>
          <p class="message">
            The customer <strong>${customer.firstName} ${customer.lastName}</strong> has been successfully deleted from the system.
            A confirmation email has been sent to the requesting agent.
          </p>
          <a href="http://localhost:3000/admin" class="btn">Back to Admin Dashboard</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Customer deletion approval error:', error);
    res.status(500).send('<h1>Server error occurred</h1>');
  }
});

router.get('/deny-deletion/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const Customer = require('../models/Customer');
    const { sendEmail } = require('../utils/resendEmail');

    const customer = await Customer.findById(customerId).populate('agentId', 'firstName lastName email');
    if (!customer) {
      return res.status(404).send('<h1>Customer not found</h1>');
    }

    if (!customer.deletionRequested) {
      return res.status(400).send('<h1>No deletion request found for this customer</h1>');
    }

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

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Customer Deletion Denied</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .container { max-width: 600px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; padding: 40px; }
          .warning-icon { font-size: 64px; margin-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .message { font-size: 18px; color: #666; line-height: 1.6; margin-bottom: 30px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="warning-icon">❌</div>
          <h1 class="title">Customer Deletion Denied</h1>
          <p class="message">
            The customer <strong>${customer.firstName} ${customer.lastName}</strong> deletion request has been denied.
            A notification email has been sent to the requesting agent.
          </p>
          <a href="http://localhost:3000/admin" class="btn">Back to Admin Dashboard</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Customer deletion denial error:', error);
    res.status(500).send('<h1>Server error occurred</h1>');
  }
});

router.get('/pending-deletions', getPendingDeletions); // Admin route, no auth for now

router.get('/agent/:agentId', getCustomersByAgent); // Admin route, no auth for now

module.exports = router;