const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const reportStore = require('../services/reportStore');

const router = express.Router();

router.post('/report', [
  auth,
  body('type').isIn(['emergency', 'incident', 'safety_concern']).withMessage('Type must be emergency, incident, or safety_concern'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
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

    const report = await reportStore.createReport({
      userId: req.userId,
      type: req.body.type,
      description: req.body.description,
      location: req.body.location
    });

    console.log('Emergency report received:', report);

    return res.status(201).json({
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
    return res.status(500).json({
      success: false,
      error: 'Server error while processing emergency report'
    });
  }
});

router.get('/status/:reportId', auth, async (req, res) => {
  try {
    const report = await reportStore.findReportById(req.params.reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Emergency report not found'
      });
    }

    return res.json({
      success: true,
      data: {
        reportId: report.id,
        status: report.status,
        lastUpdated: report.lastUpdated,
        notes: report.notes
      }
    });
  } catch (error) {
    console.error('Get emergency status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
