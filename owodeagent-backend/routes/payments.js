const express = require('express');
const { body } = require('express-validator');
const { addPaymentController } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const agentApproved = require('../middleware/agentApproved');

const router = express.Router();

router.post('/add', [
  auth,
  agentApproved,
  body('customerId').isMongoId(),
  body('amount').isNumeric(),
  body('notifyType').isIn(['none', 'sms', 'email']),
], addPaymentController);

router.get('/list', auth, agentApproved, async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const payments = await Payment.find().populate('customerId').populate('agentId');
    // Format agent name as "Agent [Last Name]"
    const formattedPayments = payments.map(payment => ({
      ...payment.toObject(),
      agentName: payment.agentId ? `Agent ${payment.agentId.lastName}` : 'Unknown Agent'
    }));
    res.json(formattedPayments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/clear-all', auth, agentApproved, async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Customer = require('../models/Customer');

    // Delete all payments
    await Payment.deleteMany({});

    // Reset all customer balances to 0
    await Customer.updateMany({}, { balance: 0 });

    res.json({ message: 'All payment history and balances cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;