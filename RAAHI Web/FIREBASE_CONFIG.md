# Firebase Configuration Guide

## Overview
This project now uses a unified Firebase configuration approach to ensure consistency between frontend and backend services.

## Configuration Files

### 1. Shared Configuration (`firebase-config.json`)
- **Location**: Root directory
- **Purpose**: Single source of truth for Firebase project settings
- **Contains**: Project ID, Auth Domain, Database URL, Storage Bucket, etc.

### 2. Frontend Configuration (`RAAHI Frontend/src/config/firebase.js`)
- **Uses**: Firebase v9 modular SDK for client-side operations
- **Features**: 
  - Client-side authentication
  - Firestore database access
  - Cloud Storage access
  - Emulator support for development
- **Environment Variables**: Uses `VITE_*` prefixed variables, falls back to shared config

### 3. Backend Configuration (`RAAHI Backend/config/firebase.js`)
- **Uses**: Firebase Admin SDK for server-side operations
- **Features**:
  - Server-side user management
  - Admin database operations
  - Token verification
  - Service account authentication
- **Environment Variables**: Standard Firebase env vars, falls back to shared config

### 4. Backend Services (`RAAHI Backend/services/firebaseAuth.js`)
- **Updated**: Now uses Firebase Admin SDK properly
- **Functions**:
  - `registerUser()`: Create users server-side
  - `verifyToken()`: Verify Firebase ID tokens
  - `deleteUser()`: Delete users by UID

## Environment Variables

### Frontend (.env file)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

### Backend (.env file)
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://oauth2.googleapis.com/token
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
```

## Current Project Settings
- **Project ID**: `raahi-adf39`
- **Auth Domain**: `raahi-adf39.firebaseapp.com`
- **Database URL**: `https://raahi-adf39-default-rtdb.firebaseio.com`
- **Storage Bucket**: `raahi-adf39.firebasestorage.app`

## Usage

### Frontend
```javascript
import { auth, db, storage } from './config/firebase.js';
// or
import { auth, db, storage } from './firebase.js'; // deprecated, redirects to config
```

### Backend
```javascript
const { initializeFirebase } = require('./config/firebase');
const { auth, database, firestore, storage } = initializeFirebase();

// Or use auth services
const { registerUser, verifyToken, deleteUser } = require('./services/firebaseAuth');
```

## Development vs Production
- **Development**: Uses Firebase emulators when available
- **Production**: Uses actual Firebase services
- **Fallbacks**: Configuration gracefully falls back from env vars to shared config to hardcoded defaults

## Security Notes
- API keys and service account credentials should be stored in environment variables
- The shared config file contains non-sensitive project identifiers only
- Never commit actual service account keys to version control