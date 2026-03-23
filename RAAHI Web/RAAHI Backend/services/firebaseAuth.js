const { initializeFirebase } = require('../config/firebase');

// Get Firebase Admin services
const { auth } = initializeFirebase();

// Register user using Firebase Admin SDK
const registerUser = async (email, password) => {
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false
    });
    console.log("User registered:", userRecord.uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      creationTime: userRecord.metadata.creationTime
    };
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
};

// Verify Firebase ID token
const verifyToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error.message);
    throw error;
  }
};

// Delete user by UID
const deleteUser = async (uid) => {
  try {
    await auth.deleteUser(uid);
    console.log("User deleted:", uid);
    return { success: true, uid };
  } catch (error) {
    console.error("Error deleting user:", error.message);
    throw error;
  }
};

module.exports = { registerUser, verifyToken, deleteUser };
