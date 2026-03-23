const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateTravelPreferences, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

// Apply input sanitization and authentication to all routes
router.use(sanitizeInput);
router.use(authenticate); // All user routes require authentication

// @desc    Get user activity history
// @route   GET /api/users/activity
// @access  Private
router.get('/activity', async (req, res, next) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    
    const user = await User.findById(req.user.id)
      .select('activityHistory')
      .slice('activityHistory', [parseInt(skip), parseInt(limit)])
      .populate('activityHistory.targetId', 'name shortDescription');

    res.status(200).json({
      success: true,
      count: user.activityHistory.length,
      data: {
        activities: user.activityHistory
      }
    });

  } catch (error) {
    console.error('Get activity history error:', error);
    next(error);
  }
});

// @desc    Add activity to user history (for AI training)
// @route   POST /api/users/activity
// @access  Private
router.post('/activity', async (req, res, next) => {
  try {
    const { action, targetType, targetId, duration, rating, metadata } = req.body;

    if (!action || !targetType || !targetId) {
      return res.status(400).json({
        success: false,
        error: 'Action, target type, and target ID are required'
      });
    }

    const validActions = ['search', 'view', 'bookmark', 'review', 'visit'];
    const validTargetTypes = ['destination', 'attraction', 'restaurant', 'hotel', 'activity'];

    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action type'
      });
    }

    if (!validTargetTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target type'
      });
    }

    const activityData = {
      action,
      targetType,
      targetId,
      timestamp: new Date()
    };

    if (duration) activityData.duration = duration;
    if (rating) activityData.rating = rating;
    if (metadata) activityData.metadata = metadata;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { activityHistory: activityData } },
      { new: true }
    );

    console.log(`📊 Activity logged for user ${user.email}: ${action} on ${targetType}`);

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: {
        activity: activityData
      }
    });

  } catch (error) {
    console.error('Add activity error:', error);
    next(error);
  }
});

// @desc    Update travel preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', validateTravelPreferences, async (req, res, next) => {
  try {
    const { travelPreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { travelPreferences },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ Travel preferences updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Travel preferences updated successfully',
      data: {
        travelPreferences: user.travelPreferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    next(error);
  }
});

// @desc    Get user statistics (for dashboard)
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate user statistics
    const stats = {
      totalActivities: user.activityHistory.length,
      activitiesByType: {},
      recentActivities: user.activityHistory.slice(-10),
      memberSince: user.createdAt,
      lastActivity: user.activityHistory.length > 0 
        ? user.activityHistory[user.activityHistory.length - 1].timestamp 
        : null,
      profileCompleteness: calculateProfileCompleteness(user)
    };

    // Count activities by type
    user.activityHistory.forEach(activity => {
      stats.activitiesByType[activity.action] = (stats.activitiesByType[activity.action] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    next(error);
  }
});

// Admin routes
router.use(authorize('admin')); // Routes below require admin role

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password -activityHistory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        users
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    next(error);
  }
});

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (user) => {
  let completeness = 0;
  const fields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth',
    'avatar',
    'location.country',
    'location.city',
    'travelPreferences.interests',
    'travelPreferences.budgetRange',
    'travelPreferences.travelStyle'
  ];

  fields.forEach(field => {
    const keys = field.split('.');
    let value = user;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completeness += 1;
    }
  });

  return Math.round((completeness / fields.length) * 100);
};

module.exports = router;
