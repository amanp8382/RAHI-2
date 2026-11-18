const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const profilePhotoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: null
  },
  dataUrl: {
    type: String,
    default: null
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'tourist_department', 'police'],
    default: 'user'
  },
  travelerId: { type: String, default: () => `RAAHI-${randomUUID()}`, unique: true },
  age: { type: Number, min: 1, max: 120 },
  destination: { type: String, default: '' },
  tripDurationDays: { type: Number, min: 1, max: 3650 },
  bloodGroup: { type: String, default: '' },
  medicalConditions: { type: String, default: '' },
  aadhaarNumber: { type: String, select: false },
  aadhaarMasked: { type: String, default: '' },
  aadhaarVerified: { type: Boolean, default: false },
  stationName: String,
  pincode: String,
  credentialHash: { type: String, default: randomUUID },
  liveLocation: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    updatedAt: Date
  },
  firebaseUid: String,
  travelPreferences: {
    type: [String],
    default: []
  },
  profilePhoto: {
    type: profilePhotoSchema,
    default: () => ({})
  },
  location: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
