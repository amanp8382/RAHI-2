const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../models/User');
const serialize = require('../utils/serializeUser');
const controller = require('../controllers/authController');

test('profile and GPS fields survive schema validation, with server traveler IDs', () => {
  const user = new User({ firstName: 'Test', lastName: 'Traveler', email: 'test@example.invalid', password: 'Test12345',
    age: 25, destination: 'Delhi', tripDurationDays: 3, bloodGroup: 'O+', medicalConditions: 'None',
    liveLocation: { lat: 28.61, lng: 77.21, accuracy: 10, updatedAt: new Date() } });
  assert.equal(user.validateSync(), undefined);
  assert.match(user.travelerId, /^RAAHI-/);
  assert.equal(user.destination, 'Delhi');
  assert.equal(user.liveLocation.lat, 28.61);
});
test('invalid GPS is rejected by the schema', () => {
  const user = new User({ firstName: 'Test', lastName: 'Traveler', email: 'test@example.invalid', password: 'Test12345', liveLocation: { lat: 100, lng: 200, accuracy: -1 } });
  const error = user.validateSync();
  assert(error.errors['liveLocation.lat']); assert(error.errors['liveLocation.lng']); assert(error.errors['liveLocation.accuracy']);
});
test('traveler responses omit passwords and full Aadhaar numbers', () => {
  const user = new User({ firstName: 'Test', lastName: 'Traveler', email: 'test@example.invalid', password: 'Test12345', aadhaarNumber: '123456789012', aadhaarMasked: 'XXXX-XXXX-9012' });
  const result = serialize(user);
  assert.equal(result.password, undefined); assert.equal(result.aadhaarNumber, undefined);
  assert.equal(result.aadhaarMasked, 'XXXX-XXXX-9012'); assert.equal(result.userType, 'tourist');
});
test('profile update cannot change role or traveler identity', async () => {
  const original = User.findByIdAndUpdate;
  let captured;
  User.findByIdAndUpdate = (id, updates) => { captured = updates; return { select: async () => new User({ _id: id, firstName: 'Test', lastName: 'Traveler', email: 'test@example.invalid', ...updates }) }; };
  try {
    const req = { user: { id: new mongoose.Types.ObjectId() }, body: { role: 'police', travelerId: 'FORGED', isActive: false, age: 25, destination: 'Delhi' } };
    const res = { status() { return this; }, json(value) { return value; } };
    await controller.updateProfile(req, res);
    assert.equal(captured.role, undefined); assert.equal(captured.travelerId, undefined); assert.equal(captured.isActive, undefined);
    assert.equal(captured.destination, 'Delhi');
  } finally { User.findByIdAndUpdate = original; }
});
