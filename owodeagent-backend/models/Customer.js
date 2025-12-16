const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  balance: { type: Number, default: 0 },
  contributionAmount: { type: Number },
  contributionFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  deletionRequested: { type: Boolean, default: false },
  deletionRequestDate: { type: Date },
  deletionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);