const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const defaultServiceAccountPath = path.join(
  __dirname,
  '../Firebase Key/raahi-adf39-firebase-adminsdk-fbsvc-a8523c020b.json'
);

const getServiceAccountPath = () => (
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : defaultServiceAccountPath
);

const hasFirebaseEnvConfig = () => (
  Boolean(process.env.FIREBASE_PRIVATE_KEY) &&
  Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
  Boolean(process.env.FIREBASE_PROJECT_ID)
);

const hasFirebaseFileConfig = () => fs.existsSync(getServiceAccountPath());

const hasFirebaseConfig = () => hasFirebaseEnvConfig() || hasFirebaseFileConfig();

const loadServiceAccount = () => {
  if (hasFirebaseEnvConfig()) {
    console.log('Using Firebase credentials from environment variables');
    return {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };
  }

  const serviceAccountPath = getServiceAccountPath();
  if (fs.existsSync(serviceAccountPath)) {
    console.log('Using Firebase credentials from service account file');
    return require(serviceAccountPath);
  }

  const error = new Error('Firebase configuration not found in environment variables or service account file');
  error.details = {
    serviceAccountPath,
    requiredEnvVars: [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ]
  };
  throw error;
};

const initializeFirebase = () => {
  try {
    const serviceAccount = loadServiceAccount();
    const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID;

    if (admin.apps.length === 0) {
      console.log('Initializing Firebase Admin SDK...');

      const initConfig = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com/`,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`
      };

      console.log('Firebase config:', {
        projectId: serviceAccount.project_id,
        databaseURL: initConfig.databaseURL,
        storageBucket: initConfig.storageBucket
      });

      admin.initializeApp(initConfig);
      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.log('Firebase Admin SDK already initialized');
    }

    const services = {
      auth: admin.auth(),
      database: admin.database(),
      firestore: admin.firestore(),
      storage: admin.storage(),
      messaging: admin.messaging()
    };

    console.log('Firebase services created:', Object.keys(services));
    return services;
  } catch (error) {
    console.error('Error initializing Firebase:', error.message);
    console.error('Firebase error details:', {
      code: error.code,
      message: error.message,
      serviceAccountPath: error.details?.serviceAccountPath,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    throw error;
  }
};

module.exports = { initializeFirebase, hasFirebaseConfig, admin };
