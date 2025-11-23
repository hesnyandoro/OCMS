const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Contains { id, role, assignedRegion }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Authorize based on roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Authorization failed: No user object in request');
      return res.status(401).json({ msg: 'Authentication required' });
    }

    console.log('Authorization check:', {
      userRole: req.user.role,
      allowedRoles,
      userId: req.user.id,
      assignedRegion: req.user.assignedRegion
    });

    if (!allowedRoles.includes(req.user.role)) {
      console.log('Authorization denied: Role mismatch');
      return res.status(403).json({ 
        msg: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    console.log('Authorization granted');
    next();
  };
};

// Export both middleware functions
module.exports = verifyToken;
module.exports.authorize = authorize;