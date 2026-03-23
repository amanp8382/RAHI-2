const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateChatbotMessage = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
];

const validateSafetyLocation = [
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 100 })
    .withMessage('Location name must be less than 100 characters'),
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Chatbot endpoint - main chatbot functionality
router.post('/chatbot', validateChatbotMessage, handleValidationErrors, async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log(`💬 Chatbot request: "${message}"`);
    
    const response = await aiService.generateChatbotResponse(message);
    
    res.json({
      success: true,
      message: response.message,
      source: response.source,
      timestamp: response.timestamp
    });
    
  } catch (error) {
    console.error('Chatbot endpoint error:', error);
    res.status(500).json({
      success: false,
      message: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Safety recommendations endpoint
router.post('/safety-recommendations', validateSafetyLocation, handleValidationErrors, async (req, res) => {
  try {
    const { location } = req.body;
    
    console.log(`🛡️ Safety recommendations request for: ${location}`);
    
    const response = await aiService.getSafetyRecommendations(location);
    
    if (response.success) {
      res.json({
        success: true,
        location,
        recommendations: response.recommendations,
        source: response.source,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: response.error || 'Unable to generate safety recommendations',
      });
    }
    
  } catch (error) {
    console.error('Safety recommendations endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to generate safety recommendations at this time',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Risk analysis endpoint
router.post('/risk-analysis', async (req, res) => {
  try {
    const { location, timeOfDay, weather, crowdLevel } = req.body;
    
    console.log(`⚠️ Risk analysis request for: ${location}`);
    
    const response = await aiService.analyzeRisk({
      location,
      timeOfDay,
      weather,
      crowdLevel
    });
    
    if (response.success) {
      res.json({
        success: true,
        location,
        riskLevel: response.riskLevel,
        factors: response.factors,
        recommendations: response.recommendations,
        timestamp: response.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        message: response.error || 'Unable to analyze risk',
      });
    }
    
  } catch (error) {
    console.error('Risk analysis endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to analyze risk at this time',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Emergency assistance endpoint
router.post('/emergency-assistance', async (req, res) => {
  try {
    const { location, emergencyType } = req.body;
    
    console.log(`🚨 Emergency assistance request: ${emergencyType} at ${location}`);
    
    // Provide immediate emergency guidance
    const emergencyResponse = {
      success: true,
      emergencyType,
      location,
      immediateActions: [],
      emergencyNumbers: {
        national: '112',
        police: '100',
        fire: '101',
        ambulance: '108',
        touristHelpline: '1363'
      },
      timestamp: new Date().toISOString()
    };

    // Customize response based on emergency type
    switch (emergencyType?.toLowerCase()) {
      case 'medical':
        emergencyResponse.immediateActions = [
          'Call 108 for ambulance immediately',
          'If conscious, keep the person calm and comfortable',
          'Do not move the person unless in immediate danger',
          'Locate nearest hospital or medical facility',
          'Contact emergency contacts'
        ];
        break;
      
      case 'safety':
      case 'security':
        emergencyResponse.immediateActions = [
          'Call 100 for police assistance',
          'Move to a safe, public place if possible',
          'Contact trusted people about your situation',
          'Stay calm and alert',
          'Document any incidents if safe to do so'
        ];
        break;
      
      case 'natural_disaster':
        emergencyResponse.immediateActions = [
          'Move to higher ground if flooding',
          'Find sturdy shelter immediately',
          'Call 112 for emergency services',
          'Follow local evacuation orders',
          'Stay informed through official channels'
        ];
        break;
      
      default:
        emergencyResponse.immediateActions = [
          'Call 112 for general emergency assistance',
          'Stay calm and assess your surroundings',
          'Move to safety if possible',
          'Contact emergency contacts',
          'Follow instructions from authorities'
        ];
    }

    res.json(emergencyResponse);
    
  } catch (error) {
    console.error('Emergency assistance endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Emergency service temporarily unavailable. Call 112 for immediate help.',
      emergencyNumbers: {
        national: '112',
        police: '100',
        fire: '101',
        ambulance: '108'
      }
    });
  }
});

// Legacy recommendations endpoint (for backward compatibility)
router.get('/recommendations', (req, res) => {
  res.json({ 
    success: true,
    message: 'AI recommendations service is active. Use POST endpoints for specific requests.',
    availableEndpoints: {
      chatbot: 'POST /ai/chatbot',
      safetyRecommendations: 'POST /ai/safety-recommendations',
      riskAnalysis: 'POST /ai/risk-analysis',
      emergencyAssistance: 'POST /ai/emergency-assistance'
    }
  });
});

// Health check for AI service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'AI Service',
    status: 'operational',
    geminiConfigured: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
