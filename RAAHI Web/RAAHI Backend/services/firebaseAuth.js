const { initializeFirebase } = require('../config/firebase');

const getAuth = () => {
  const { auth } = initializeFirebase();
  return auth;
};

const registerUser = async (email, password) => {
  try {
    const auth = getAuth();
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false
    });

    console.log('User registered:', userRecord.uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      creationTime: userRecord.metadata.creationTime
    };
  } catch (error) {
    console.error('Error registering user:', error.message);
    throw error;
  }
};

const verifyToken = async (idToken) => {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error.message);
    throw error;
  }
};

const deleteUser = async (uid) => {
  try {
    const auth = getAuth();
    await auth.deleteUser(uid);
    console.log('User deleted:', uid);
    return { success: true, uid };
  } catch (error) {
    console.error('Error deleting user:', error.message);
    throw error;
  }
};

module.exports = { registerUser, verifyToken, deleteUser };
