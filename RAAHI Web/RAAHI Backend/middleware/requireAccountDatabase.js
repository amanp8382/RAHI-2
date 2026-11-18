const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      code: 'ACCOUNT_DATABASE_UNAVAILABLE',
      message: 'Account database is unavailable. Please try again shortly.'
    });
  }
  return next();
};
