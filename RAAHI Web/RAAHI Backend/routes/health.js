const express = require('express');
const databaseManager = require('../config/database');
const { initializeFirebase } = require('../config/firebase');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Smart Tourism Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check with database and Firebase status
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      service: 'Smart Tourism Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: null,
      firebase: null
    };

    // Check database health if connected
    try {
      if (databaseManager.isHealthy && databaseManager.isHealthy().overall) {
        const dbTests = await databaseManager.testConnections();
        health.database = dbTests;
      } else {
        health.database = { status: 'disconnected' };
        health.status = 'degraded';
      }
    } catch (error) {
      health.database = { status: 'error', error: error.message };
      health.status = 'degraded';
    }

    // Check Firebase health
    try {
      const firebaseServices = initializeFirebase();
      health.firebase = {
        status: 'connected',
        project_id: process.env.FIREBASE_PROJECT_ID,
        services: {
          auth: !!firebaseServices.auth,
          firestore: !!firebaseServices.firestore,
          storage: !!firebaseServices.storage,
          messaging: !!firebaseServices.messaging,
          database: !!firebaseServices.database
        }
      };
    } catch (firebaseError) {
      health.firebase = { 
        status: 'error', 
        error: firebaseError.message 
      };
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      service: 'Smart Tourism Backend',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Firebase-specific health check endpoint
router.get('/firebase', async (req, res) => {
  try {
    const firebaseHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      firebase: null
    };

    try {
      const firebaseServices = initializeFirebase();
      
      // Test each service
      const services = {};
      
      // Auth service test
      try {
        services.auth = {
          available: !!firebaseServices.auth,
          methods: typeof firebaseServices.auth?.createUser === 'function'
        };
      } catch (e) {
        services.auth = { available: false, error: e.message };
      }
      
      // Storage service test
      try {
        const storage = firebaseServices.storage;
        const bucket = storage.bucket();
        services.storage = {
          available: true,
          bucket: bucket.name
        };
      } catch (e) {
        services.storage = { available: false, error: e.message };
      }
      
      // Firestore service test
      try {
        services.firestore = {
          available: !!firebaseServices.firestore
        };
      } catch (e) {
        services.firestore = { available: false, error: e.message };
      }
      
      // Realtime Database service test
      try {
        services.database = {
          available: !!firebaseServices.database,
          url: process.env.FIREBASE_DATABASE_URL
        };
      } catch (e) {
        services.database = { available: false, error: e.message };
      }
      
      // Messaging service test
      try {
        services.messaging = {
          available: !!firebaseServices.messaging
        };
      } catch (e) {
        services.messaging = { available: false, error: e.message };
      }
      
      firebaseHealth.firebase = {
        status: 'connected',
        project_id: process.env.FIREBASE_PROJECT_ID,
        services: services
      };
      
    } catch (firebaseError) {
      firebaseHealth.firebase = {
        status: 'error',
        error: firebaseError.message
      };
      firebaseHealth.status = 'error';
    }

    const statusCode = firebaseHealth.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(firebaseHealth);

  } catch (error) {
    console.error('Firebase health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
