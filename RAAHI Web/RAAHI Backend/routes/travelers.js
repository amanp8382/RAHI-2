const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const requireDatabase = require('../middleware/requireAccountDatabase');
const serialize = require('../utils/serializeUser');
const router = express.Router();
router.use(authenticate, requireDatabase);
router.use(rateLimit({ windowMs: 60000, max: 120, keyGenerator: req => req.user._id.toString(), standardHeaders: true, legacyHeaders: false }));
router.put('/me/location', async (req, res, next) => {
  try {
    const { lat, lng, accuracy } = req.body;
    if (![lat, lng].every(Number.isFinite) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || (accuracy != null && (!Number.isFinite(accuracy) || accuracy < 0))) {
      return res.status(400).json({ success: false, message: 'Invalid GPS coordinates or accuracy' });
    }
    const liveLocation = { lat, lng, ...(accuracy != null ? { accuracy } : {}), updatedAt: new Date() };
    await User.updateOne({ _id: req.user._id }, { $set: { liveLocation } }, { runValidators: true });
    return res.json({ success: true, location: liveLocation });
  } catch (error) { next(error); }
});
router.get('/', authorize('police', 'admin', 'tourist_department'), async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user', isActive: true }).sort({ createdAt: -1 }).limit(1000);
    return res.json({ success: true, travelers: users.map(serialize), limit: 1000 });
  } catch (error) { next(error); }
});
router.get('/:travelerId', async (req, res, next) => {
  try {
    if (req.user.travelerId !== req.params.travelerId && !['police', 'admin', 'tourist_department'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'This traveler record is private' });
    }
    const user = await User.findOne({ travelerId: req.params.travelerId, isActive: true });
    if (!user) return res.status(404).json({ success: false, message: 'Traveler not found' });
    return res.json({ success: true, record: serialize(user) });
  } catch (error) { next(error); }
});
module.exports = router;
