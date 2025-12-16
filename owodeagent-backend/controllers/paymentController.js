const { validationResult } = require('express-validator');
const { addPayment } = require('../services/paymentService');

const addPaymentController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { customerId, amount, paymentDate, notifyType } = req.body;

  try {
    const result = await addPayment(customerId, req.agent.id, amount, notifyType, paymentDate);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Customer has no email') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addPaymentController };