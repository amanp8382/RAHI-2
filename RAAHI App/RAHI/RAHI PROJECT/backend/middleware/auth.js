const jwt = require('jsonwebtoken');
const userStore = require('../services/userStore');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No token provided, authorization denied'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided, authorization denied'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await userStore.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token is valid but user no longer exists'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User account has been deactivated'
        });
      }

      req.userId = decoded.userId;
      req.user = user;

      return next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired'
        });
      }

      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      throw tokenError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

module.exports = auth;
