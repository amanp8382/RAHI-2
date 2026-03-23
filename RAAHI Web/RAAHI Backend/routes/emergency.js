const express = require('express');
const { optionalAuthWithGuest } = require('../middleware/auth');
const admin = require('firebase-admin');
const databaseManager = require('../config/database');
const router = express.Router();

// Get Firebase Admin services (with improved error handling)
const getFirebaseServices = () => {
  try {
    // First check if Firebase admin is initialized
    if (admin.apps.length === 0) {
      console.error('❌ Firebase Admin SDK not initialized');
      return null;
    }
    
    // Try to get services from database manager first
    try {
      const services = databaseManager.getFirebaseServices();
      if (services) {
        return services;
      }
    } catch (dbError) {
      console.warn('⚠️  Database manager Firebase services not available:', dbError.message);
    }
    
    // Fallback to direct admin services
    return {
      database: admin.database(),
      firestore: admin.firestore(),
      auth: admin.auth(),
      storage: admin.storage(),
      messaging: admin.messaging()
    };
  } catch (error) {
    console.error('❌ Firebase services not available:', error.message);
    console.error('💡 Make sure Firebase is properly configured in your .env file');
    return null;
  }
};

// Panic button trigger endpoint
router.post('/panic', optionalAuthWithGuest, async (req, res) => {
  try {
    const { email, location, timestamp, userAgent, status, userId } = req.body;
    
    // Validate required data
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid location (latitude, longitude) is required for panic alerts'
      });
    }
    
    // Get Firebase Admin services
    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }
    
    // Generate user ID if not provided
    const finalUserId = userId || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alertId = `panic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create panic alert data for Firestore (following the structure: users/{uid}/panic_alerts/{alertId})
    const panicAlert = {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: finalUserId,
      userEmail: email || 'anonymous@guest.com',
      userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Anonymous User',
      status: status || 'active',
      resolved: false,
      userAgent: userAgent || 'Unknown',
      isAnonymous: !req.user || req.user === null,
      alertId: alertId
    };
    
    // Save to Firebase Admin Firestore
    // Structure: users/{userId}/panic_alerts/{alertId}
    const userDocRef = firebase.firestore.collection('users').doc(finalUserId);
    const panicAlertRef = userDocRef.collection('panic_alerts').doc(alertId);
    
    // Ensure user document exists
    await userDocRef.set({
      uid: finalUserId,
      email: panicAlert.userEmail,
      displayName: panicAlert.userName,
      isAnonymous: panicAlert.isAnonymous,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Save panic alert
    await panicAlertRef.set(panicAlert);
    
    console.log('🚨 PANIC ALERT SAVED TO FIRESTORE:', {
      alertId: alertId,
      userId: finalUserId,
      email: panicAlert.userEmail,
      location: { latitude: panicAlert.latitude, longitude: panicAlert.longitude },
      path: `users/${finalUserId}/panic_alerts/${alertId}`
    });
    
    // You can add additional notifications here:
    // - Send SMS to emergency contacts
    // - Email notifications to admin
    // - Push notifications to emergency services
    
    res.json({
      success: true,
      message: 'Panic alert sent successfully to Firebase Admin',
      alertId: alertId,
      userId: finalUserId,
      location: {
        latitude: panicAlert.latitude,
        longitude: panicAlert.longitude
      },
      timestamp: new Date().toISOString(),
      firestorePath: `users/${finalUserId}/panic_alerts/${alertId}`
    });
    
  } catch (error) {
    console.error('❌ Panic Alert Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process panic alert',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get panic alerts (for admin/emergency services)
router.get('/panic-alerts', optionalAuthWithGuest, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    
    // Get Firebase Admin services
    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }
    
    console.log('📈 Fetching panic alerts from Firestore collection group...');
    
    // Use collection group query to get all panic_alerts from all users
    let query = firebase.firestore.collectionGroup('panic_alerts')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));
    
    // Add status filter if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    const alerts = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Extract user ID from document path: users/{userId}/panic_alerts/{alertId}
      const pathParts = doc.ref.path.split('/');
      const userId = pathParts[1];
      
      alerts.push({
        id: doc.id,
        userId: userId,
        userEmail: data.userEmail || 'Unknown',
        userName: data.userName || 'Unknown User',
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
        status: data.status || 'active',
        resolved: data.resolved || false,
        isAnonymous: data.isAnonymous || false,
        userAgent: data.userAgent,
        alertId: data.alertId,
        // Format timestamp for easier reading
        timestampFormatted: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    console.log(`✅ Retrieved ${alerts.length} panic alerts from Firestore`);
    
    res.json({
      success: true,
      message: 'Panic alerts retrieved successfully from Firebase Admin',
      alerts: alerts,
      count: alerts.length,
      source: 'Firebase Admin Firestore'
    });
    
  } catch (error) {
    console.error('❌ Get Panic Alerts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve panic alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update panic alert status
router.put('/panic-alerts/:id/status', optionalAuthWithGuest, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['active', 'resolved', 'false_alarm', 'in_progress'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    // Get Firebase Admin services
    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }
    
    // Use Firestore to find and update the panic alert
    // Since we're using collection group queries, we need to find the document first
    const alertQuery = firebase.firestore.collectionGroup('panic_alerts').where('alertId', '==', id);
    const querySnapshot = await alertQuery.get();
    
    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Panic alert not found'
      });
    }
    
    // Update the first matching document (should be unique anyway)
    const doc = querySnapshot.docs[0];
    await doc.ref.update({
      status: status,
      notes: notes || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user ? req.user.email : 'system',
      resolved: status === 'resolved' || status === 'false_alarm'
    });
    
    console.log(`📋 Panic alert ${id} status updated to: ${status}`);
    
    res.json({
      success: true,
      message: 'Panic alert status updated successfully',
      alertId: id,
      newStatus: status
    });
    
  } catch (error) {
    console.error('❌ Update Panic Alert Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update panic alert status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Test endpoint for panic button (no auth required)
router.post('/test-panic', async (req, res) => {
  try {
    console.log('🧪 Testing panic button functionality...');
    
    // Test data
    const testLocation = {
      latitude: 28.6139, // Delhi coordinates
      longitude: 77.2090
    };
    
    // Get Firebase Admin services
    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable - check Firebase configuration'
      });
    }
    
    const alertId = `test_panic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = `test_user_${Date.now()}`;
    
    // Create test panic alert
    const testAlert = {
      latitude: testLocation.latitude,
      longitude: testLocation.longitude,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: userId,
      userEmail: 'test@panic.com',
      userName: 'Test User',
      status: 'active',
      resolved: false,
      userAgent: 'Test Agent',
      isAnonymous: true,
      alertId: alertId,
      isTestAlert: true
    };
    
    // Save to Firebase
    const userDocRef = firebase.firestore.collection('users').doc(userId);
    const panicAlertRef = userDocRef.collection('panic_alerts').doc(alertId);
    
    await userDocRef.set({
      uid: userId,
      email: testAlert.userEmail,
      displayName: testAlert.userName,
      isAnonymous: true,
      isTestUser: true,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    await panicAlertRef.set(testAlert);
    
    console.log('✅ Test panic alert created successfully');
    
    res.json({
      success: true,
      message: '🚨 Panic button test successful!',
      testAlert: {
        alertId: alertId,
        userId: userId,
        location: testLocation,
        firestorePath: `users/${userId}/panic_alerts/${alertId}`
      },
      firebase: {
        available: true,
        services: ['firestore', 'database', 'auth']
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Panic button test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Panic button test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      firebase: {
        available: false,
        error: error.message
      }
    });
  }
});

// Test endpoint to check Firebase connection
router.get('/test-firebase', (req, res) => {
  try {
    const firebase = getFirebaseServices();
    
    res.json({
      success: true,
      message: 'Firebase connection is working',
      timestamp: new Date().toISOString(),
      services: firebase ? Object.keys(firebase) : [],
      databaseURL: admin.app().options.databaseURL || 'Not configured',
      projectId: admin.app().options.projectId || 'Not configured'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firebase connection failed',
      error: error.message
    });
  }
});

module.exports = router;