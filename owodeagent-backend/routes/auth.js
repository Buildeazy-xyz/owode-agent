const express = require('express');
const { body } = require('express-validator');
const { registerAgent, approveAgent, login, getPendingAgents, getAllAgents, getAllAgentsForAdmin, getAgentById } = require('../controllers/authController');

const router = express.Router();

router.post('/register-agent', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
    .matches(/^(\+?[1-9]\d{1,14}|\d{10,15})$/).withMessage('Phone number must be valid (e.g., +1234567890 or 1234567890)'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], registerAgent);

router.post('/approve-agent', approveAgent); // Admin route, no auth for now

router.get('/pending-agents', getPendingAgents); // Admin route, no auth for now

router.get('/all-agents', getAllAgentsForAdmin); // Admin route, no auth for now

router.get('/agent/:id', getAgentById); // Admin route, no auth for now

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], login);

// Test SMS route (for development/testing)
router.post('/test-sms', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ message: 'Phone and message are required' });
    }

    const { sendSMS } = require('../utils/sendSMS');
    const result = await sendSMS(phone, message);

    if (result.success) {
      res.json({ message: 'SMS sent successfully', sid: result.sid });
    } else {
      res.status(500).json({ message: 'SMS failed', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;