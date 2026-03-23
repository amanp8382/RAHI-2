// Firebase Auth Service for Panic Button System
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Initialize Firebase Auth with anonymous sign-in
 * This ensures every user gets a proper UID for Firestore document structure
 */
export const initializeFirebaseAuth = () => {
  return new Promise((resolve, reject) => {
    // Check if user is already signed in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User is already signed in
          console.log('🔐 Firebase Auth: User already signed in with UID:', user.uid);
          resolve(user);
        } else {
          // Sign in anonymously to get a UID
          console.log('🔐 Firebase Auth: Signing in anonymously...');
          const userCredential = await signInAnonymously(auth);
          const anonymousUser = userCredential.user;
          console.log('✅ Firebase Auth: Anonymous sign-in successful with UID:', anonymousUser.uid);
          resolve(anonymousUser);
        }
      } catch (error) {
        console.error('❌ Firebase Auth error:', error);
        reject(error);
      } finally {
        unsubscribe(); // Clean up the listener
      }
    });
  });
};

/**
 * Get current Firebase Auth user
 * @returns {User|null} Current Firebase user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get current user UID with fallback
 * @returns {string} User UID or anonymous fallback
 */
export const getCurrentUserUID = () => {
  const user = auth.currentUser;
  if (user) {
    return user.uid;
  }
  
  // Generate anonymous UID as fallback
  const anonymousUID = 'anonymous_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.warn('⚠️ No Firebase Auth user found, using anonymous UID:', anonymousUID);
  return anonymousUID;
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    await auth.signOut();
    console.log('✅ Firebase Auth: User signed out');
  } catch (error) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
};

export default {
  initializeFirebaseAuth,
  getCurrentUser,
  getCurrentUserUID,
  onAuthStateChange,
  signOut
};