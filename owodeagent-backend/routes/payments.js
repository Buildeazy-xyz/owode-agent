const express = require('express');
const { body } = require('express-validator');
const { addPaymentController, getPayments, getPaymentsByCustomer, clearAllPayments } = require('../controllers/paymentController');
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

router.get('/customer/:customerId', auth, agentApproved, getPaymentsByCustomer);

// Get recent payments (last 5)
router.get('/recent/:customerId', auth, agentApproved, async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const payments = await Payment.find({
      customerId: req.params.customerId,
      agentId: req.agent.id
    })
    .populate('customerId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Admin route to see all payments with customer details
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.agent.role !== 'super-admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const Payment = require('../models/Payment');
    const payments = await Payment.find()
      .populate('customerId', 'firstName lastName')
      .populate('agentId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    const formattedPayments = payments.map(payment => ({
      ...payment.toObject(),
      agentName: payment.agentId ? `Agent ${payment.agentId.lastName}` : 'Unknown Agent',
      customerName: payment.customerId ? `${payment.customerId.firstName} ${payment.customerId.lastName}` : 'Unknown Customer'
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