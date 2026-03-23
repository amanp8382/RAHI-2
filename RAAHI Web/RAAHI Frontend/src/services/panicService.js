// Panic Alert Service - Firebase v9 Modular SDK
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  query, 
  collectionGroup, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getCurrentUserUID, initializeFirebaseAuth } from './authService';

/**
 * Send a panic alert to Firestore
 * Structure: users/{uid}/panic_alerts/{alertId}
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude 
 * @returns {Promise<string>} - Document ID of the created alert
 */
export const sendPanicAlert = async (latitude, longitude) => {
  try {
    console.log('🚨 Starting panic alert process...');
    
    // Ensure Firebase Auth is initialized
    let currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('🔐 No authenticated user, initializing Firebase Auth...');
      currentUser = await initializeFirebaseAuth();
    }
    
    const userId = currentUser ? currentUser.uid : getCurrentUserUID();
    console.log('👤 Using user ID:', userId);
    
    // Create user document reference
    const userDocRef = doc(db, 'users', userId);
    
    // Ensure user document exists (create if it doesn't)
    await setDoc(userDocRef, {
      uid: userId,
      email: currentUser?.email || 'anonymous@guest.com',
      displayName: currentUser?.displayName || 'Anonymous User',
      isAnonymous: currentUser?.isAnonymous || true,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
    
    // Create panic alert data
    const alertData = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      timestamp: serverTimestamp(),
      userId: userId,
      userEmail: currentUser?.email || 'anonymous@guest.com',
      userName: currentUser?.displayName || 'Anonymous User',
      status: 'active',
      resolved: false,
      isAnonymous: currentUser?.isAnonymous || true
    };
    
    console.log('📍 Alert data:', {
      latitude: alertData.latitude,
      longitude: alertData.longitude,
      userId: alertData.userId,
      userEmail: alertData.userEmail
    });
    
    // Add alert to user's panic_alerts subcollection
    const panicAlertsRef = collection(userDocRef, 'panic_alerts');
    const docRef = await addDoc(panicAlertsRef, alertData);
    
    console.log('✅ Panic alert sent successfully:', {
      alertId: docRef.id,
      userId: userId,
      location: { latitude, longitude },
      path: `users/${userId}/panic_alerts/${docRef.id}`
    });
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending panic alert:', error);
    throw new Error('Failed to send panic alert: ' + error.message);
  }
};

/**
 * Listen to all panic alerts from all users in real-time
 * @param {Function} callback - Function to call with updated alerts array
 * @returns {Function} - Unsubscribe function
 */
export const listenToAllAlerts = (callback) => {
  try {
    console.log('👂 Setting up real-time listener for all panic alerts...');
    
    // Create a collection group query to get all panic_alerts from all users
    const alertsQuery = query(
      collectionGroup(db, 'panic_alerts'),
      orderBy('timestamp', 'desc')
    );
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const alerts = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Extract user ID from the document reference path
        // Path format: users/{userId}/panic_alerts/{alertId}
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
          // Convert Firestore timestamp to JavaScript Date for display
          timestampDate: data.timestamp ? data.timestamp.toDate() : new Date()
        });
      });
      
      console.log(`📊 Received ${alerts.length} panic alerts from Firestore`);
      callback(alerts);
    }, (error) => {
      console.error('❌ Error listening to panic alerts:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up panic alerts listener:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Get all panic alerts (one-time fetch)
 * @returns {Promise<Array>} - Array of panic alerts
 */
export const getAllAlerts = async () => {
  try {
    const alertsQuery = query(
      collectionGroup(db, 'panic_alerts'),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(alertsQuery);
    const alerts = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
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
        timestampDate: data.timestamp ? data.timestamp.toDate() : new Date()
      });
    });
    
    return alerts;
  } catch (error) {
    console.error('❌ Error fetching panic alerts:', error);
    return [];
  }
};

/**
 * Update panic alert status
 * @param {string} userId - User ID
 * @param {string} alertId - Alert document ID
 * @param {string} status - New status ('active', 'resolved', 'false_alarm')
 * @param {boolean} resolved - Whether alert is resolved
 */
export const updateAlertStatus = async (userId, alertId, status, resolved = false) => {
  try {
    const alertRef = doc(db, 'users', userId, 'panic_alerts', alertId);
    
    await updateDoc(alertRef, {
      status: status,
      resolved: resolved,
      updatedAt: serverTimestamp()
    });
    
    console.log(`📋 Alert ${alertId} status updated to: ${status}`);
  } catch (error) {
    console.error('❌ Error updating alert status:', error);
    throw error;
  }
};

/**
 * Format timestamp for display
 * @param {Date} timestamp - JavaScript Date object
 * @returns {string} - Formatted timestamp DD/MM/YYYY HH:mm:ss
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Invalid Date';
  
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Initialize Firebase Auth for panic button system
 * Call this when the app loads to ensure users have proper UIDs
 */
export const initializePanicSystem = async () => {
  try {
    console.log('🚀 Initializing panic button system...');
    
    // Initialize Firebase Auth
    const user = await initializeFirebaseAuth();
    
    console.log('✅ Panic system initialized successfully with user:', {
      uid: user.uid,
      email: user.email || 'anonymous',
      isAnonymous: user.isAnonymous
    });
    
    return user;
  } catch (error) {
    console.error('❌ Failed to initialize panic system:', error);
    throw error;
  }
};

export default {
  sendPanicAlert,
  listenToAllAlerts,
  getAllAlerts,
  updateAlertStatus,
  formatTimestamp,
  initializePanicSystem
};