const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  role: { type: String, default: 'agent' }
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);