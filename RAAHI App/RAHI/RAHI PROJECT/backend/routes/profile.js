const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const userStore = require('../services/userStore');

const router = express.Router();

router.put('/update', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters')
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

    const currentUser = await userStore.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = await userStore.updateUserById(req.userId, {
      name: req.body.name !== undefined ? req.body.name : currentUser.name,
      phone: req.body.phone !== undefined ? req.body.phone : currentUser.phone,
      address: req.body.address !== undefined ? req.body.address : currentUser.address
    });

    return res.json({
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
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.put('/emergency-contacts', [
  auth,
  body('emergencyContacts').isArray({ max: 5 }).withMessage('Emergency contacts must be an array with maximum 5 contacts'),
  body('emergencyContacts.*.name').trim().isLength({ min: 1, max: 50 }).withMessage('Contact name is required and must be less than 50 characters'),
  body('emergencyContacts.*.phone').isMobilePhone().withMessage('Please enter a valid phone number for emergency contact'),
  body('emergencyContacts.*.relationship').optional().trim().isLength({ max: 30 }).withMessage('Relationship must be less than 30 characters')
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

    const user = await userStore.updateUserById(req.userId, {
      emergencyContacts: req.body.emergencyContacts
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      data: {
        emergencyContacts: user.emergencyContacts
      }
    });
  } catch (error) {
    console.error('Emergency contacts update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.put('/location-settings', [
  auth,
  body('shareLocation').optional().isBoolean().withMessage('shareLocation must be a boolean'),
  body('emergencyLocationSharing').optional().isBoolean().withMessage('emergencyLocationSharing must be a boolean')
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

    const currentUser = await userStore.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = await userStore.updateUserById(req.userId, {
      locationSettings: {
        shareLocation: req.body.shareLocation !== undefined ? req.body.shareLocation : currentUser.locationSettings.shareLocation,
        emergencyLocationSharing: req.body.emergencyLocationSharing !== undefined
          ? req.body.emergencyLocationSharing
          : currentUser.locationSettings.emergencyLocationSharing
      }
    });

    return res.json({
      success: true,
      message: 'Location settings updated successfully',
      data: {
        locationSettings: user.locationSettings
      }
    });
  } catch (error) {
    console.error('Location settings update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.put('/notification-settings', [
  auth,
  body('pushNotifications').optional().isBoolean().withMessage('pushNotifications must be a boolean'),
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications must be a boolean'),
  body('emergencyAlerts').optional().isBoolean().withMessage('emergencyAlerts must be a boolean')
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

    const currentUser = await userStore.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = await userStore.updateUserById(req.userId, {
      notificationSettings: {
        pushNotifications: req.body.pushNotifications !== undefined ? req.body.pushNotifications : currentUser.notificationSettings.pushNotifications,
        emailNotifications: req.body.emailNotifications !== undefined ? req.body.emailNotifications : currentUser.notificationSettings.emailNotifications,
        emergencyAlerts: req.body.emergencyAlerts !== undefined ? req.body.emergencyAlerts : currentUser.notificationSettings.emergencyAlerts
      }
    });

    return res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        notificationSettings: user.notificationSettings
      }
    });
  } catch (error) {
    console.error('Notification settings update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.delete('/delete', auth, async (req, res) => {
  try {
    const user = await userStore.deactivateUserById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const user = await userStore.findById(req.userId);
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

    return res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

function calculateProfileCompleteness(user) {
  let completeness = 0;
  const fields = ['name', 'email', 'phone', 'address'];

  fields.forEach((field) => {
    if (user[field] && String(user[field]).trim().length > 0) {
      completeness += 25;
    }
  });

  if (user.emergencyContacts.length > 0) {
    completeness += Math.min(user.emergencyContacts.length * 10, 20);
  }

  return Math.min(completeness, 100);
}

module.exports = router;
