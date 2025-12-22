const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const { sendEmail } = require('../utils/resendEmail');
const { sendSMS } = require('../utils/sendSMS');

const registerAgent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const agent = new Agent({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      status: 'pending', // Explicitly set status to pending
    });
    await agent.save();

    console.log(`New agent registered with ID: ${agent._id} and status: ${agent.status}`);

    // Send email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Agent Registration</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .tagline { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .agent-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; margin: 20px 0; }
          .agent-name { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
          .agent-detail { margin: 8px 0; font-size: 16px; }
          .action-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
          .highlight { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Owode Agent</div>
            <div class="tagline">Professional Agent Management System</div>
          </div>

          <div class="content">
            <h1 class="title">🎉 New Agent Registration</h1>
            <p>A new agent has registered and is waiting for approval.</p>

            <div class="agent-card">
              <div class="agent-name">${firstName} ${lastName}</div>
              <div class="highlight">
                <div class="agent-detail">📧 Email: ${email}</div>
                <div class="agent-detail">📱 Phone: ${phone}</div>
                <div class="agent-detail">🆔 Agent ID: ${agent._id}</div>
              </div>
            </div>

            <p>Please review and approve this agent registration.</p>

            <a href="https://owode.xyz/admin" class="action-btn">Review Agent Applications</a>
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
      '🎉 New Agent Registration - Action Required',
      adminEmailHtml
    );

    res.status(201).json({ message: 'Agent registered successfully', agentId: agent._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const approveAgent = async (req, res) => {
  const { agentId } = req.body;

  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.status = 'approved';
    agent.approvedAt = new Date();
    await agent.save();

    // Send immediate SMS notification
    const smsResult = await sendSMS(agent.phone, `Dear ${agent.firstName} ${agent.lastName}, your account has been approved. Welcome to Owode Agent!`);
    if (!smsResult.success) {
      console.error('Agent approval SMS failed:', smsResult.error);
    }

    // Send immediate email notification
    const approvalEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved - Welcome to Owode Agent</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .tagline { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .welcome-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin: 20px 0; text-align: center; }
          .welcome-message { font-size: 18px; margin-bottom: 15px; }
          .agent-info { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin: 15px 0; }
          .feature-list { margin: 25px 0; }
          .feature { background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #667eea; }
          .action-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
          .success-icon { font-size: 48px; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Owode Agent</div>
            <div class="tagline">Welcome to Professional Agent Management</div>
          </div>

          <div class="content">
            <h1 class="title">🎉 Congratulations! Your Account is Approved</h1>

            <div class="welcome-card">
              <div class="success-icon">✅</div>
              <div class="welcome-message">Welcome aboard, ${agent.firstName} ${agent.lastName}!</div>
              <div class="agent-info">
                <strong>Your account is now active and ready to use.</strong><br>
                Start managing customers and processing payments immediately.
              </div>
            </div>

            <div class="feature-list">
              <h3 style="color: #333; margin-bottom: 15px;">What you can do now:</h3>

              <div class="feature">
                <strong>👥 Customer Management</strong><br>
                Create and manage customer profiles with contribution tracking
              </div>

              <div class="feature">
                <strong>💰 Payment Processing</strong><br>
                Record payments with automated notifications and balance updates
              </div>

              <div class="feature">
                <strong>📊 Progress Tracking</strong><br>
                Monitor customer payment progress with visual calendars
              </div>

              <div class="feature">
                <strong>📧 Communication</strong><br>
                Send professional notifications via email and SMS
              </div>
            </div>

            <div style="text-align: center;">
              <a href="https://owode.xyz/login" class="action-btn">Login to Your Dashboard</a>
            </div>

            <p style="text-align: center; margin-top: 20px; color: #666;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>

          <div class="footer">
            <p>This email confirms your agent account approval</p>
            <p>© 2024 Owode Agent Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await sendEmail(agent.email, '🎉 Welcome to Owode Agent - Account Approved!', approvalEmailHtml);
    if (!emailResult.success) {
      console.error('Agent approval email failed:', emailResult.error);
    }

    res.json({ message: 'Agent approved successfully. Welcome email and SMS have been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if agent is approved
    if (agent.status !== 'approved') {
      return res.status(401).json({ message: 'Account not approved. Please wait for admin approval.' });
    }

    const isMatch = await bcrypt.compare(password, agent.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: agent._id, role: agent.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      agent: {
        id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        role: agent.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingAgents = async (req, res) => {
  try {
    console.log('Fetching pending agents...');
    const pendingAgents = await Agent.find({ status: 'pending' }).select('firstName lastName email phone createdAt');
    console.log(`Found ${pendingAgents.length} pending agents`);
    res.json(pendingAgents);
  } catch (error) {
    console.error('Error fetching pending agents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllAgents = async (req, res) => {
  try {
    // Only super-admin can view all agents
    if (req.agent.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allAgents = await Agent.find({}).select('firstName lastName email phone status role createdAt');
    res.json(allAgents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllAgentsForAdmin = async (req, res) => {
  try {
    console.log('Fetching all agents for admin...');
    const allAgents = await Agent.find({})
      .select('firstName lastName email phone status role createdAt approvedAt')
      .sort({ createdAt: -1 });
    console.log(`Found ${allAgents.length} agents`);
    res.json(allAgents);
  } catch (error) {
    console.error('Error fetching all agents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAgentById = async (req, res) => {
  try {
    console.log('Fetching agent by ID:', req.params.id);
    const agent = await Agent.findById(req.params.id)
      .select('firstName lastName email phone status role createdAt approvedAt');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    console.log('Found agent:', agent.firstName, agent.lastName);
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerAgent, approveAgent, login, getPendingAgents, getAllAgentsForAdmin, getAgentById };