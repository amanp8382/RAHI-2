const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const admin = require('firebase-admin');
const { getHardcodedGeofences, checkLocationInHardcodedGeofences } = require('../config/geofences');
const router = express.Router();

// Get Firebase Admin services (similar to emergency routes)
const getFirebaseServices = () => {
  try {
    if (admin.apps.length === 0) {
      console.error('❌ Firebase Admin SDK not initialized');
      return null;
    }
    
    return {
      database: admin.database(),
      firestore: admin.firestore(),
      auth: admin.auth(),
      storage: admin.storage(),
      messaging: admin.messaging()
    };
  } catch (error) {
    console.error('❌ Firebase services not available:', error.message);
    return null;
  }
};

// CREATE Geofence
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      radius,
      color,
      type,
      isActive = true
    } = req.body;

    // Validation
    if (!name || !latitude || !longitude || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, longitude, and radius are required'
      });
    }

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude (must be between -90 and 90)'
      });
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude (must be between -180 and 180)'
      });
    }

    if (typeof radius !== 'number' || radius < 10 || radius > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be between 10 and 10000 meters'
      });
    }

    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }

    const geofenceId = `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const geofenceData = {
      id: geofenceId,
      name: name.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: Number(radius),
      color: color || '#ff0000',
      type: type || 'monitoring',
      isActive: Boolean(isActive),
      createdBy: req.user.id,
      createdByEmail: req.user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    await firebase.firestore
      .collection('geofences')
      .doc(geofenceId)
      .set(geofenceData);

    console.log('✅ Geofence created:', geofenceId);

    res.status(201).json({
      success: true,
      message: 'Geofence created successfully',
      geofence: {
        ...geofenceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Create Geofence Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create geofence',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET All Geofences
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { limit = 50, isActive, type, userId } = req.query;

    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }

    let query = firebase.firestore
      .collection('geofences')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    // Add filters if provided
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    if (type) {
      query = query.where('type', '==', type);
    }

    if (userId && req.user) {
      query = query.where('createdBy', '==', userId);
    }

    const snapshot = await query.get();
    const geofences = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      geofences.push({
        id: doc.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        color: data.color,
        type: data.type,
        isActive: data.isActive,
        createdBy: data.createdBy,
        createdByEmail: data.createdByEmail,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
      });
    });

    console.log(`✅ Retrieved ${geofences.length} geofences`);

    res.json({
      success: true,
      message: 'Geofences retrieved successfully',
      geofences: geofences,
      count: geofences.length,
      total: geofences.length
    });

  } catch (error) {
    console.error('❌ Get Geofences Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve geofences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET Single Geofence
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }

    const doc = await firebase.firestore
      .collection('geofences')
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Geofence not found'
      });
    }

    const data = doc.data();
    const geofence = {
      id: doc.id,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      color: data.color,
      type: data.type,
      isActive: data.isActive,
      createdBy: data.createdBy,
      createdByEmail: data.createdByEmail,
      createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Geofence retrieved successfully',
      geofence: geofence
    });

  } catch (error) {
    console.error('❌ Get Geofence Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve geofence',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// UPDATE Geofence
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.createdBy;
    delete updates.createdByEmail;
    delete updates.createdAt;

    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }

    const docRef = firebase.firestore.collection('geofences').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Geofence not found'
      });
    }

    // Check if user owns this geofence (or is admin)
    const data = doc.data();
    if (data.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this geofence'
      });
    }

    // Validate updates
    if (updates.latitude !== undefined) {
      if (typeof updates.latitude !== 'number' || updates.latitude < -90 || updates.latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude (must be between -90 and 90)'
        });
      }
    }

    if (updates.longitude !== undefined) {
      if (typeof updates.longitude !== 'number' || updates.longitude < -180 || updates.longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid longitude (must be between -180 and 180)'
        });
      }
    }

    if (updates.radius !== undefined) {
      if (typeof updates.radius !== 'number' || updates.radius < 10 || updates.radius > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Radius must be between 10 and 10000 meters'
        });
      }
    }

    // Add updatedAt timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await docRef.update(updates);

    console.log('✅ Geofence updated:', id);

    res.json({
      success: true,
      message: 'Geofence updated successfully',
      geofenceId: id
    });

  } catch (error) {
    console.error('❌ Update Geofence Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update geofence',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE Geofence
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }

    const docRef = firebase.firestore.collection('geofences').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Geofence not found'
      });
    }

    // Check if user owns this geofence (or is admin)
    const data = doc.data();
    if (data.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this geofence'
      });
    }

    await docRef.delete();

    console.log('✅ Geofence deleted:', id);

    res.json({
      success: true,
      message: 'Geofence deleted successfully',
      geofenceId: id
    });

  } catch (error) {
    console.error('❌ Delete Geofence Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete geofence',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Check if location is within any geofences
router.post('/check', optionalAuth, async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required'
      });
    }

    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }

    // Get all active geofences
    const snapshot = await firebase.firestore
      .collection('geofences')
      .where('isActive', '==', true)
      .get();

    const matches = [];
    const userLocation = { latitude, longitude };

    snapshot.forEach(doc => {
      const geofence = doc.data();
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        matches.push({
          id: doc.id,
          name: geofence.name,
          type: geofence.type,
          distance: Math.round(distance),
          radius: geofence.radius,
          color: geofence.color
        });
      }
    });

    console.log(`🔍 Location check: ${matches.length} geofences matched`);

    res.json({
      success: true,
      message: 'Location checked successfully',
      location: userLocation,
      matches: matches,
      count: matches.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Check Location Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check location',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Utility function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// GET Hardcoded Geofences (simple endpoint for code-based geofences)
router.get('/hardcoded', (req, res) => {
  try {
    const geofences = getHardcodedGeofences();
    
    console.log(`✅ Retrieved ${geofences.length} hardcoded geofences`);
    
    res.json({
      success: true,
      message: 'Hardcoded geofences retrieved successfully',
      geofences: geofences,
      count: geofences.length,
      source: 'hardcoded_config'
    });
    
  } catch (error) {
    console.error('❌ Get Hardcoded Geofences Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hardcoded geofences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Check location against hardcoded geofences
router.post('/check-hardcoded', (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required'
      });
    }

    const matches = checkLocationInHardcodedGeofences(latitude, longitude);
    
    console.log(`🔍 Hardcoded location check: ${matches.length} geofences matched`);

    res.json({
      success: true,
      message: 'Location checked against hardcoded geofences',
      location: { latitude, longitude },
      matches: matches,
      count: matches.length,
      source: 'hardcoded_config',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Check Hardcoded Location Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check location against hardcoded geofences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
