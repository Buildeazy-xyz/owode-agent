const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  console.log('Auth middleware - Token present:', !!token);
  console.log('Auth middleware - Token preview:', token ? token.substring(0, 20) + '...' : 'none');
  
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully:', decoded.email || decoded.id);
    req.agent = decoded;
    next();
  } catch (error) {
    console.log('Auth middleware - Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;