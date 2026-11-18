const connectMongoDB = require('./mongodb');
const { initializeFirebase, hasFirebaseConfig } = require('./firebase');

class DatabaseManager {
  constructor() {
    this.mongoConnection = null;
    this.firebaseServices = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      console.log('Initializing database connections...');

      await this.connectMongoWithRetry();

      try {
        if (hasFirebaseConfig() && process.env.FIREBASE_PROJECT_ID !== 'your-project-id') {
          this.firebaseServices = initializeFirebase();
          console.log('Firebase services initialized');
        } else {
          console.log('Firebase not configured - skipping Firebase initialization');
          this.firebaseServices = null;
        }
      } catch (firebaseError) {
        console.warn('Firebase initialization failed:', firebaseError.message);
        console.log('Server will continue without Firebase - update .env with proper Firebase credentials');
        this.firebaseServices = null;
      }

      this.isConnected = true;
      console.log('Database initialization complete; health endpoint reports connection status');

      return {
        mongodb: require('mongoose').connection.readyState === 1,
        firebase: this.firebaseServices
      };
    } catch (error) {
      console.error('Database connection failed:', error.message);
      console.log('Server will start without database connection. Some features may not work.');
      return {
        mongodb: false,
        firebase: this.firebaseServices
      };
    }
  }

  async connectMongoWithRetry() {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('username:password@cluster.mongodb.net')) return;
    if (this.mongoConnecting) return;
    this.mongoConnecting = true;
    try {
      await connectMongoDB();
      const User = require('../models/User');
      await User.collection.updateMany({ travelerId: { $exists: false } }, [
        { $set: { travelerId: { $concat: ['RAAHI-', { $toString: '$_id' }] } } }
      ]);
      await User.createIndexes();
      await require('../models/TourismRecord').createIndexes();
      await require('./migratePoliceAccounts')();
      if (this.mongoRetryTimer) clearInterval(this.mongoRetryTimer);
      this.mongoRetryTimer = null;
      console.log('MongoDB connected; account/profile/location storage ready');
    } catch (error) {
      console.warn(`MongoDB unavailable (${error.name}); retrying in 30 seconds`);
      if (!this.mongoRetryTimer) {
        this.mongoRetryTimer = setInterval(() => { void this.connectMongoWithRetry(); }, 30000);
        this.mongoRetryTimer.unref();
      }
    } finally { this.mongoConnecting = false; }
  }

  getFirebaseServices() {
    if (!this.firebaseServices) {
      throw new Error('Firebase not initialized. Call connect() first.');
    }
    return this.firebaseServices;
  }

  async disconnect() {
    try {
      if (this.mongoRetryTimer) clearInterval(this.mongoRetryTimer);
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('MongoDB connection closed');

      this.isConnected = false;
      console.log('All database connections closed');
    } catch (error) {
      console.error('Error disconnecting from databases:', error.message);
      throw error;
    }
  }

  isHealthy() {
    const mongoose = require('mongoose');
    return {
      mongodb: mongoose.connection.readyState === 1,
      firebase: this.firebaseServices !== null,
      overall: this.isConnected && mongoose.connection.readyState === 1
    };
  }

  async testConnections() {
    const health = this.isHealthy();
    const results = {
      mongodb: { status: 'disconnected', latency: null, error: null },
      firebase: { status: 'disconnected', latency: null, error: null }
    };

    if (health.mongodb) {
      try {
        const start = Date.now();
        const mongoose = require('mongoose');
        await mongoose.connection.db.admin().ping();
        results.mongodb = {
          status: 'connected',
          latency: Date.now() - start,
          error: null
        };
      } catch (error) {
        results.mongodb = {
          status: 'error',
          latency: null,
          error: error.message
        };
      }
    }

    if (health.firebase) {
      try {
        const start = Date.now();
        await this.firebaseServices.database.ref('.info/connected').once('value');
        results.firebase = {
          status: 'connected',
          latency: Date.now() - start,
          error: null
        };
      } catch (error) {
        results.firebase = {
          status: 'error',
          latency: null,
          error: error.message
        };
      }
    }

    return results;
  }
}

const databaseManager = new DatabaseManager();
module.exports = databaseManager;
