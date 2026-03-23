const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/profile/update
// @desc    Update user profile
// @access  Private
router.put('/update', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, phone, address } = req.body;

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          profilePicture: user.profilePicture,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/profile/emergency-contacts
// @desc    Update emergency contacts
// @access  Private
router.put('/emergency-contacts', [
  auth,
  body('emergencyContacts')
    .isArray({ max: 5 })
    .withMessage('Emergency contacts must be an array with maximum 5 contacts'),
  body('emergencyContacts.*.name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact name is required and must be less than 50 characters'),
  body('emergencyContacts.*.phone')
    .isMobilePhone()
    .withMessage('Please enter a valid phone number for emergency contact'),
  body('emergencyContacts.*.relationship')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Relationship must be less than 30 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { emergencyContacts } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.emergencyContacts = emergencyContacts;
    await user.save();

    res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      data: {
        emergencyContacts: user.emergencyContacts
      }
    });

  } catch (error) {
    console.error('Emergency contacts update error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/profile/location-settings
// @desc    Update location settings
// @access  Private
router.put('/location-settings', [
  auth,
  body('shareLocation')
    .optional()
    .isBoolean()
    .withMessage('shareLocation must be a boolean'),
  body('emergencyLocationSharing')
    .optional()
    .isBoolean()
    .withMessage('emergencyLocationSharing must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { shareLocation, emergencyLocationSharing } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update location settings
    if (shareLocation !== undefined) {
      user.locationSettings.shareLocation = shareLocation;
    }
    if (emergencyLocationSharing !== undefined) {
      user.locationSettings.emergencyLocationSharing = emergencyLocationSharing;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Location settings updated successfully',
      data: {
        locationSettings: user.locationSettings
      }
    });

  } catch (error) {
    console.error('Location settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/profile/notification-settings
// @desc    Update notification settings
// @access  Private
router.put('/notification-settings', [
  auth,
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications must be a boolean'),
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),
  body('emergencyAlerts')
    .optional()
    .isBoolean()
    .withMessage('emergencyAlerts must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { pushNotifications, emailNotifications, emergencyAlerts } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update notification settings
    if (pushNotifications !== undefined) {
      user.notificationSettings.pushNotifications = pushNotifications;
    }
    if (emailNotifications !== undefined) {
      user.notificationSettings.emailNotifications = emailNotifications;
    }
    if (emergencyAlerts !== undefined) {
      user.notificationSettings.emergencyAlerts = emergencyAlerts;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        notificationSettings: user.notificationSettings
      }
    });

  } catch (error) {
    console.error('Notification settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/profile/delete
// @desc    Delete user account
// @access  Private
router.delete('/delete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete - mark as inactive instead of actually deleting
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/profile/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const stats = {
      memberSince: user.createdAt,
      lastLogin: user.lastLogin,
      emergencyContactsCount: user.emergencyContacts.length,
      profileCompleteness: calculateProfileCompleteness(user)
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user) {
  let completeness = 0;
  const fields = ['name', 'email', 'phone', 'address'];
  
  fields.forEach(field => {
    if (user[field] && user[field].trim().length > 0) {
      completeness += 25;
    }
  });

  // Bonus for emergency contacts
  if (user.emergencyContacts.length > 0) {
    completeness += Math.min(user.emergencyContacts.length * 10, 20);
  }

  return Math.min(completeness, 100);
}

module.exports = router;