const express = require('express');
const {
  register,
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

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.post('/register', validateRegistration, validateTravelPreferences, register);
router.post('/login', validateLogin, login);
router.post('/tourist-dept-login', touristDepartmentLogin);
router.post('/verify-firebase', verifyFirebaseToken);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.get('/me', getMe);
router.post('/logout', logout);
router.put('/profile', validateProfileUpdate, validateTravelPreferences, updateProfile);
router.put('/password', changePassword);

module.exports = router;
