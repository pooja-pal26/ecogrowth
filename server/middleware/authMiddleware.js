const jwt = require('jsonwebtoken');
const config = require('../config');

exports.protect = (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * Role-Based Access Middleware
 * Accepts role keys ('admin', 'accountant', 'supervisor', 'project_manager', 'management')
 * or numeric role IDs ('1', '16', '15', etc.)
 */
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRoleKey = req.user.role_key || '';
    const userRoleId = String(req.user.role || '');

    // Admin always has universal access
    if (userRoleKey === 'admin' || userRoleId === '1' || userRoleId === '17') {
      return next();
    }

    const isAuthorized = allowedRoles.some(r => {
      const target = String(r).toLowerCase();
      return target === userRoleKey.toLowerCase() || target === userRoleId;
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted for ${req.user.role_name || 'your role'}`
      });
    }

    next();
  };
};
