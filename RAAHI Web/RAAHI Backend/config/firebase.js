const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Try to use environment variables first, fall back to service account file
let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
  // Use environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
    token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs`,
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };
  console.log('✅ Using Firebase credentials from environment variables');
} else {
  // Fall back to service account file
  const serviceAccountPath = 'D:\\Smart tourism\\Documents\\GitHub\\rahinew\\RAAHI Web\\RAAHI Backend\\Firebase Key\\raahi-adf39-firebase-adminsdk-fbsvc-a8523c020b.json';

  // Check if the service account file exists before trying to load it
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Error: Firebase service account key file not found at:', serviceAccountPath);
    console.error('Please download the key from the Firebase console and place it at the specified path.');
    throw new Error('Firebase configuration not found in environment variables or service account file');
  }

  // Load the service account credentials directly from the file
  serviceAccount = require(serviceAccountPath);
  console.log('✅ Using Firebase credentials from service account file');
}

// Firebase project configuration
const FIREBASE_CONFIG = {
  databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
};

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      console.log('🔥 Initializing Firebase Admin SDK...');

      const initConfig = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: FIREBASE_CONFIG.databaseURL,
        storageBucket: FIREBASE_CONFIG.storageBucket
      };

      console.log('🔧 Firebase config:', {
        projectId: serviceAccount.project_id,
        databaseURL: initConfig.databaseURL,
        storageBucket: initConfig.storageBucket
      });

      admin.initializeApp(initConfig);
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      console.log('🔥 Firebase Admin SDK already initialized');
    }

    const services = {
      auth: admin.auth(),
      database: admin.database(),
      firestore: admin.firestore(),
      storage: admin.storage(),
      messaging: admin.messaging()
    };

    console.log('🛠️  Firebase services created:', Object.keys(services));
    return services;

  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.error('Firebase error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    throw error;
  }
};

module.exports = { initializeFirebase, admin };