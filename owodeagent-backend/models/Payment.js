const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'cash' },
  notifyType: { type: String, enum: ['none', 'sms', 'email'], default: 'none' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);