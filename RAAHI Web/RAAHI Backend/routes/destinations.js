const express = require('express');
const { optionalAuthWithGuest, authenticate } = require('../middleware/auth');
const router = express.Router();

// Public route - accessible without authentication
router.get('/', optionalAuthWithGuest, (req, res) => {
  // Sample destinations data
  const destinations = [
    {
      id: 1,
      name: 'Delhi Red Fort',
      location: 'Delhi, India',
      category: 'Historical',
      rating: 4.2,
      safetyRating: 4.0,
      description: 'Historic fortified palace and UNESCO World Heritage Site',
      image: '/images/red-fort.jpg',
      isPublic: true
    },
    {
      id: 2,
      name: 'Goa Beaches',
      location: 'Goa, India',
      category: 'Beach',
      rating: 4.5,
      safetyRating: 4.3,
      description: 'Beautiful beaches with pristine sand and clear waters',
      image: '/images/goa-beach.jpg',
      isPublic: true
    },
    {
      id: 3,
      name: 'Kerala Backwaters',
      location: 'Kerala, India',
      category: 'Nature',
      rating: 4.7,
      safetyRating: 4.5,
      description: 'Serene backwaters with houseboat experiences',
      image: '/images/kerala-backwaters.jpg',
      isPublic: true
    }
  ];

  res.json({
    success: true,
    message: 'Destinations retrieved successfully',
    destinations: destinations,
    user: req.isAuthenticated ? {
      authenticated: true,
      name: req.user.firstName + ' ' + req.user.lastName
    } : {
      authenticated: false,
      message: 'Browsing as guest'
    }
  });
});

// Public route for tourist safety tips
router.get('/safety-tips', (req, res) => {
  const safetyTips = [
    {
      id: 1,
      title: 'Stay Connected',
      description: 'Always keep your phone charged and carry a portable charger',
      category: 'communication'
    },
    {
      id: 2,
      title: 'Emergency Contacts',
      description: 'Save local emergency numbers including police, ambulance, and tourist helpline',
      category: 'emergency'
    },
    {
      id: 3,
      title: 'Local Guidelines',
      description: 'Research and follow local customs, dress codes, and cultural norms',
      category: 'culture'
    },
    {
      id: 4,
      title: 'Safe Transportation',
      description: 'Use registered taxis, verified ride-sharing apps, or official tourist transport',
      category: 'transport'
    }
  ];

  res.json({
    success: true,
    message: 'Safety tips retrieved successfully',
    tips: safetyTips
  });
});

// Protected route - requires authentication
router.get('/my-bookings', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Your bookings (requires authentication)',
    user: req.user.firstName + ' ' + req.user.lastName,
    bookings: []
  });
});

module.exports = router;
