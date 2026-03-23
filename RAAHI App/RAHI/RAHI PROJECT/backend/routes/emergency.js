const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/emergency/report
// @desc    Report an emergency or incident
// @access  Private
router.post('/report', [
  auth,
  body('type')
    .isIn(['emergency', 'incident', 'safety_concern'])
    .withMessage('Type must be emergency, incident, or safety_concern'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
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

    const { type, description, location } = req.body;

    // Here you would typically save to a database
    // For now, we'll just log and return success
    const report = {
      id: Date.now().toString(),
      userId: req.userId,
      type,
      description,
      location,
      timestamp: new Date(),
      status: 'pending'
    };

    console.log('Emergency report received:', report);

    res.status(201).json({
      success: true,
      message: 'Emergency report submitted successfully',
      data: {
        reportId: report.id,
        status: report.status,
        timestamp: report.timestamp
      }
    });

  } catch (error) {
    console.error('Emergency report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing emergency report'
    });
  }
});

// @route   GET /api/emergency/status/:reportId
// @desc    Get emergency report status
// @access  Private
router.get('/status/:reportId', auth, async (req, res) => {
  try {
    const { reportId } = req.params;

    // In a real app, you'd fetch from database
    // For now, return mock data
    const mockStatus = {
      reportId,
      status: 'in_progress',
      lastUpdated: new Date(),
      notes: 'Emergency services have been notified'
    };

    res.json({
      success: true,
      data: mockStatus
    });

  } catch (error) {
    console.error('Get emergency status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;