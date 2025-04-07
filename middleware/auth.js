
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        return res.status(401).json({ message: 'Token validation failed' });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return [
    authenticate,
    (req, res, next) => {
      // If no specific roles are required
      if (roles.length === 0) {
        return next();
      }
      
      // Check if user role is in the allowed roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      
      next();
    }
  ];
};

// Check if user can delete (only managers)
const canDelete = [
  authenticate,
  (req, res, next) => {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden: Only managers can delete resources' });
    }
    next();
  }
];

// Check if user can create or update (managers and staff)
const canModify = [
  authenticate,
  (req, res, next) => {
    if (req.user.role !== 'manager' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Forbidden: Only managers and staff can modify resources' });
    }
    next();
  }
];

module.exports = { authenticate, authorize, canDelete, canModify };
