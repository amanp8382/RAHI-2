const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isMongoAvailable } = require('./db');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

const defaultUserShape = {
  profilePicture: null,
  isActive: true,
  lastLogin: null,
  emergencyContacts: [],
  locationSettings: {
    shareLocation: true,
    emergencyLocationSharing: true
  },
  notificationSettings: {
    pushNotifications: true,
    emailNotifications: false,
    emergencyAlerts: true
  }
};

const ensureStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, '[]', 'utf8');
  }
};

const readUsers = async () => {
  await ensureStore();
  const raw = await fs.readFile(usersFile, 'utf8');
  return JSON.parse(raw);
};

const writeUsers = async (users) => {
  await ensureStore();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
};

const normalizeLocalUser = (user) => ({
  ...defaultUserShape,
  ...user,
  _id: user._id || user.id,
  id: user.id || user._id,
  createdAt: user.createdAt || new Date().toISOString(),
  updatedAt: user.updatedAt || new Date().toISOString()
});

const sanitizeUser = (user) => {
  const next = { ...user };
  delete next.password;
  return next;
};

const updateUserById = async (id, updates) => {
  const users = await readUsers();
  const index = users.findIndex((entry) => entry._id === id || entry.id === id);
  if (index === -1) return null;

  const current = normalizeLocalUser(users[index]);
  const next = {
    ...current,
    ...updates,
    emergencyContacts: updates.emergencyContacts ?? current.emergencyContacts,
    locationSettings: {
      ...current.locationSettings,
      ...(updates.locationSettings || {})
    },
    notificationSettings: {
      ...current.notificationSettings,
      ...(updates.notificationSettings || {})
    },
    updatedAt: new Date().toISOString()
  };

  if (updates.password) {
    next.password = await bcrypt.hash(updates.password, await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS, 10) || 12));
  }

  users[index] = next;
  await writeUsers(users);
  return sanitizeUser(wrapLocalUser(next));
};

const wrapLocalUser = (user) => {
  const normalized = normalizeLocalUser(user);
  return {
    ...normalized,
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, normalized.password);
    },
    async updateLastLogin() {
      const nextLogin = new Date().toISOString();
      const updated = await updateUserById(normalized._id, { lastLogin: nextLogin });
      Object.assign(this, updated);
      return this;
    }
  };
};

const findLocalByEmail = async (email, options = {}) => {
  const users = await readUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const wrapped = wrapLocalUser(user);
  return options.includePassword ? wrapped : sanitizeUser(wrapped);
};

const findLocalById = async (id, options = {}) => {
  const users = await readUsers();
  const user = users.find((entry) => entry._id === id || entry.id === id);
  if (!user) return null;
  const wrapped = wrapLocalUser(user);
  return options.includePassword ? wrapped : sanitizeUser(wrapped);
};

const createLocalUser = async ({ email, password, name, phone, address }) => {
  const users = await readUsers();
  const now = new Date().toISOString();
  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS, 10) || 12));
  const user = {
    ...defaultUserShape,
    _id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: phone || '',
    address: address || '',
    createdAt: now,
    updatedAt: now
  };
  users.push(user);
  await writeUsers(users);
  return sanitizeUser(wrapLocalUser(user));
};

const buildMongoQuery = (query) => ({
  async select(selection) {
    return query.select(selection);
  },
  then(resolve, reject) {
    return query.then(resolve, reject);
  },
  catch(reject) {
    return query.catch(reject);
  }
});

const findByEmail = (email) => {
  if (isMongoAvailable()) {
    return buildMongoQuery(User.findOne({ email: email.toLowerCase() }));
  }
  return {
    async select(selection) {
      return findLocalByEmail(email, { includePassword: selection === '+password' });
    },
    then(resolve, reject) {
      return findLocalByEmail(email).then(resolve, reject);
    },
    catch(reject) {
      return findLocalByEmail(email).catch(reject);
    }
  };
};

const findById = (id) => {
  if (isMongoAvailable()) {
    return buildMongoQuery(User.findById(id));
  }
  return {
    async select(selection) {
      return findLocalById(id, { includePassword: selection === '+password' });
    },
    then(resolve, reject) {
      return findLocalById(id).then(resolve, reject);
    },
    catch(reject) {
      return findLocalById(id).catch(reject);
    }
  };
};

const createUser = async (payload) => {
  if (isMongoAvailable()) {
    const user = new User(payload);
    await user.save();
    return user;
  }
  return createLocalUser(payload);
};

const deactivateUserById = async (id) => updateUserById(id, { isActive: false });

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUserById,
  deactivateUserById
};
