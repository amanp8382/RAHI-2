const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isMongoAvailable } = require('./db');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'users.json');

const defaultUserShape = {
  phone: '',
  address: '',
  age: '',
  destination: '',
  tripDurationDays: '',
  bloodGroup: '',
  medicalConditions: '',
  aadhaarNumber: '',
  aadhaarVerified: false,
  travelPreferences: [],
  profilePhoto: null,
  emergencyContacts: [],
  locationSettings: {
    shareLocation: true,
    emergencyLocationSharing: true
  },
  notificationSettings: {
    pushNotifications: true,
    emailNotifications: false,
    emergencyAlerts: true
  },
  isActive: true,
  lastLogin: null
};

const normalizeLocalUser = (user) => ({
  ...defaultUserShape,
  ...user,
  travelPreferences: Array.isArray(user.travelPreferences) ? user.travelPreferences : [],
  emergencyContacts: Array.isArray(user.emergencyContacts) ? user.emergencyContacts : [],
  locationSettings: {
    ...defaultUserShape.locationSettings,
    ...(user.locationSettings || {})
  },
  notificationSettings: {
    ...defaultUserShape.notificationSettings,
    ...(user.notificationSettings || {})
  }
});

const ensureStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify({ users: [] }, null, 2));
  }
};

const readStore = async () => {
  await ensureStore();
  const raw = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(raw);
};

const writeStore = async (store) => {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2));
};

const publicUser = (user) => {
  if (!user) return null;

  return {
    id: user.id || user._id,
    _id: user._id || user.id,
    name: user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: user.fullName || user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    age: user.age || '',
    destination: user.destination || '',
    tripDurationDays: user.tripDurationDays || '',
    bloodGroup: user.bloodGroup || '',
    medicalConditions: user.medicalConditions || '',
    aadhaarNumber: user.aadhaarNumber || '',
    aadhaarVerified: Boolean(user.aadhaarVerified),
    travelPreferences: Array.isArray(user.travelPreferences) ? user.travelPreferences : [],
    profilePhoto: user.profilePhoto || null,
    profilePicture: user.profilePicture || user.profilePhoto || null,
    emergencyContacts: Array.isArray(user.emergencyContacts) ? user.emergencyContacts : [],
    locationSettings: user.locationSettings || defaultUserShape.locationSettings,
    notificationSettings: user.notificationSettings || defaultUserShape.notificationSettings,
    role: user.role || 'user',
    userType: user.userType || 'tourist',
    travelerId: user.travelerId || '',
    publicCardPath: user.publicCardPath || '',
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    isActive: user.isActive !== false
  };
};

const toMongoUserPayload = (payload) => ({
  ...payload,
  name: payload.name || [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim(),
  firstName: payload.firstName || '',
  lastName: payload.lastName || '',
  fullName: payload.fullName || payload.name || [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim()
});

const createLocalUser = async (payload) => {
  const store = await readStore();
  const now = new Date().toISOString();
  const email = payload.email.toLowerCase();
  const passwordHash = await bcrypt.hash(payload.password, parseInt(process.env.BCRYPT_ROUNDS, 10) || 12);

  const user = normalizeLocalUser({
    id: crypto.randomUUID(),
    _id: crypto.randomUUID(),
    email,
    password: passwordHash,
    name: payload.name || [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim(),
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    fullName: payload.fullName || payload.name || [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim(),
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
    role: payload.role || 'user',
    userType: payload.userType || 'tourist',
    ...payload
  });

  store.users.push(user);
  await writeStore(store);
  return user;
};

const updateLocalUser = async (userId, updates) => {
  const store = await readStore();
  const index = store.users.findIndex((entry) => entry.id === userId || entry._id === userId);
  if (index < 0) {
    return null;
  }

  const current = normalizeLocalUser(store.users[index]);
  const nextUser = normalizeLocalUser({
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  });
  store.users[index] = nextUser;
  await writeStore(store);
  return nextUser;
};

const getLocalUserById = async (userId) => {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId || entry._id === userId);
  return user ? normalizeLocalUser(user) : null;
};

const getLocalUserByEmail = async (email) => {
  const store = await readStore();
  const user = store.users.find((entry) => entry.email === email.toLowerCase());
  return user ? normalizeLocalUser(user) : null;
};

const verifyLocalPassword = async (user, password) => bcrypt.compare(password, user.password);

const findByEmail = async (email, options = {}) => {
  const normalizedEmail = email.toLowerCase();
  if (isMongoAvailable()) {
    let query = User.findOne({ email: normalizedEmail });
    if (options.includePassword) {
      query = query.select('+password');
    }
    const user = await query;
    return user ? publicUser(user.toObject ? user.toObject() : user) : null;
  }

  const user = await getLocalUserByEmail(normalizedEmail);
  if (!user) return null;
  return options.includePassword ? user : publicUser(user);
};

const findById = async (userId, options = {}) => {
  if (isMongoAvailable()) {
    let query = User.findById(userId);
    if (options.includePassword) {
      query = query.select('+password');
    }
    const user = await query;
    return user ? publicUser(user.toObject ? user.toObject() : user) : null;
  }

  const user = await getLocalUserById(userId);
  if (!user) return null;
  return options.includePassword ? user : publicUser(user);
};

const createUser = async (payload) => {
  if (isMongoAvailable()) {
    const user = new User(toMongoUserPayload(payload));
    await user.save();
    await user.updateLastLogin();
    const refreshed = await User.findById(user._id);
    return publicUser(refreshed.toObject());
  }

  const localUser = await createLocalUser(payload);
  return publicUser(localUser);
};

const comparePassword = async (user, password) => {
  if (isMongoAvailable()) {
    const mongoUser = await User.findById(user.id || user._id).select('+password');
    if (!mongoUser) return false;
    return mongoUser.comparePassword(password);
  }

  return verifyLocalPassword(user, password);
};

const touchLastLogin = async (userId) => {
  if (isMongoAvailable()) {
    const user = await User.findById(userId);
    if (user) {
      await user.updateLastLogin();
    }
    return;
  }

  await updateLocalUser(userId, { lastLogin: new Date().toISOString() });
};

const updateUser = async (userId, updates) => {
  if (isMongoAvailable()) {
    const user = await User.findById(userId).select('+password');
    if (!user) return null;

    Object.entries(updates).forEach(([key, value]) => {
      user[key] = value;
    });
    await user.save();

    const refreshed = await User.findById(userId);
    return refreshed ? publicUser(refreshed.toObject()) : null;
  }

  const localUser = await updateLocalUser(userId, updates);
  return localUser ? publicUser(localUser) : null;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  comparePassword,
  touchLastLogin,
  updateUser,
  publicUser
};
