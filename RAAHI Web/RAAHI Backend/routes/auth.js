const express = require('express');
const {
  register,
  policeLogin,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  verifyFirebaseToken,
  touristDepartmentLogin
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateTravelPreferences,
  sanitizeInput
} = require('../middleware/validation');

const requireAccountDatabase = require('../middleware/requireAccountDatabase');
const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.post('/register', validateRegistration, validateTravelPreferences, requireAccountDatabase, register);
router.post('/police-login', requireAccountDatabase, policeLogin);
router.post('/login', validateLogin, requireAccountDatabase, login);
router.post('/tourist-dept-login', requireAccountDatabase, touristDepartmentLogin);
router.post('/verify-firebase', verifyFirebaseToken);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.get('/me', getMe);
router.post('/logout', logout);
router.put('/profile', validateProfileUpdate, validateTravelPreferences, updateProfile);
router.put('/password', changePassword);

module.exports = router;
