const Agent = require('../models/Agent');

const agentApproved = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.agent.id);
    if (!agent || agent.status !== 'approved') {
      return res.status(403).json({ message: 'Agent not approved' });
    }
    req.agentData = agent;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = agentApproved;