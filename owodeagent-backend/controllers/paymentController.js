const { validationResult } = require('express-validator');
const { addPayment } = require('../services/paymentService');
const Payment = require('../models/Payment');

const addPaymentController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { customerId, amount, paymentDate, notifyType, paymentIndex } = req.body;

  try {
    const result = await addPayment(customerId, req.agent.id, amount, notifyType, paymentDate, paymentIndex);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Customer has no email') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ agentId: req.agent.id })
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPaymentsByCustomer = async (req, res) => {
  try {
    const payments = await Payment.find({
      customerId: req.params.customerId,
      agentId: req.agent.id
    }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const clearAllPayments = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Customer = require('../models/Customer');

    // Delete all payments for this agent
    await Payment.deleteMany({ agentId: req.agent.id });

    // Reset all customer balances for this agent to 0
    await Customer.updateMany({ agentId: req.agent.id }, { balance: 0 });

    res.json({ message: 'All payment history and balances cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addPaymentController, getPayments, getPaymentsByCustomer, clearAllPayments };