const express = require('express');
const Record = require('../models/TourismRecord');
const requireDatabase = require('../middleware/requireAccountDatabase');
const { stateFor } = require('../utils/tourism');
const router = express.Router();
router.get('/', requireDatabase, async (req, res, next) => {
  try {
    const state = stateFor({ location: req.query.state });
    if (!state) return res.status(400).json({ success: false, message: 'Enter a valid Indian state or union territory' });
    const now = new Date();
    const base = { state };
    const [advisories, destinations, services] = await Promise.all([
      Record.find({ ...base, kind: 'advisories', status: 'published', verified: true, $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }] })
        .select('title description city district severity source sourceUrl publishedAt expiresAt updatedAt').sort({ publishedAt: -1 }).limit(100).lean(),
      Record.find({ ...base, kind: 'destinations', status: { $in: ['open', 'limited access', 'closed'] } })
        .select('title description city district status category openingHours entryFee facilities accessibility updatedAt').sort({ title: 1 }).limit(100).lean(),
      Record.find({ ...base, kind: 'services', status: 'approved', verified: true })
        .select('title description city district serviceType phone address website updatedAt').sort({ title: 1 }).limit(100).lean()
    ]);
    res.set('Cache-Control', 'no-store').json({ success: true, state, advisories, destinations, services, limitPerSection: 100 });
  } catch (e) { next(e); }
});
module.exports = router;
