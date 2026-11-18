const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { authenticate, authorize } = require('../middleware/auth');
const requireDatabase = require('../middleware/requireAccountDatabase');
const Record = require('../models/TourismRecord');
const User = require('../models/User');
const { stateFor, statuses, validateRecord, escapeRegex, csv, buildMetrics, destinationPattern } = require('../utils/tourism');
const router = express.Router();
router.use(authenticate, authorize('tourist_department'), requireDatabase);
router.use(rateLimit({ windowMs: 60000, max: 90, keyGenerator: req => req.user._id.toString(), standardHeaders: true, legacyHeaders: false }));
router.use((req, res, next) => {
  req.departmentState = stateFor(req.user);
  if (!req.departmentState) return res.status(403).json({ success: false, message: 'This department account needs a valid assigned state in its location field.' });
  res.set('Cache-Control', 'no-store');
  next();
});
async function metrics(state) {
  const records = await Record.find({ state }).lean();
  const match = destinationPattern(state);
  // Scope by declared travel destination. Never expose personal profiles or raw GPS.
  const users = await User.find({ role: 'user', isActive: true, destination: match })
    .select('destination tripDurationDays createdAt liveLocation -_id').limit(10001).lean();
  return { ...buildMetrics(users.slice(0, 10000), records), truncated: users.length > 10000,
    state, scopeNote: 'Registered travel plans matching this state or its managed destinations; registrations are not confirmed visits. GPS data covers this app only.' };
}
router.get('/overview', async (req, res, next) => { try { res.json({ success: true, overview: await metrics(req.departmentState) }); } catch (e) { next(e); } });
router.get('/tourists', async (req, res, next) => {
  try {
    const page = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1));
    const limit = 50;
    const filter = { role: 'user', isActive: true, destination: destinationPattern(req.departmentState) };
    if (req.query.q) {
      const query = new RegExp(escapeRegex(String(req.query.q).slice(0, 100)), 'i');
      filter.$or = ['firstName', 'lastName', 'travelerId', 'destination'].map(key => ({ [key]: query }));
    }
    const [users, total] = await Promise.all([
      User.find(filter).select('travelerId firstName lastName destination tripDurationDays createdAt updatedAt -_id')
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, state: req.departmentState, total, page, limit,
      tourists: users.map(user => ({ travelerId: user.travelerId, name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        destination: user.destination, tripDurationDays: user.tripDurationDays, registeredAt: user.createdAt, updatedAt: user.updatedAt })) });
  } catch (e) { next(e); }
});
router.get('/reports.csv', async (req, res, next) => {
  try {
    const result = await metrics(req.departmentState);
    const rows = [['State', 'Section', 'Metric', 'Value'],
      ...['registrations', 'recentGPS', 'averageTripDays', 'openComplaints', 'resolvedComplaints', 'averageRating', 'openCases', 'averageResponseMinutes', 'activeAdvisories', 'approvedServices'].map(key => [req.departmentState, 'Summary', key, result[key]]),
      ...result.monthlyRegistrations.map(row => [req.departmentState, 'Monthly registrations', row.month, row.count]),
      ...result.popularDestinations.map(row => [req.departmentState, 'Travel plans', row.name, row.count])];
    const records = await Record.find({ state: req.departmentState }).sort({ createdAt: -1 }).limit(10000).lean();
    rows.push(['State', 'Record type', 'Title', 'Status', 'Created', 'Updated']);
    for (const row of records) rows.push([row.state, row.kind, row.title, row.status, row.createdAt.toISOString(), row.updatedAt.toISOString()]);
    rows.push([req.departmentState, 'Notes', result.scopeNote, result.truncated ? 'Registration data capped at 10000 rows' : '']);
    res.type('text/csv').attachment('tourism-report.csv').send('\uFEFF' + csv(rows));
  } catch (e) { next(e); }
});
router.get('/records/:kind', async (req, res, next) => {
  try {
    if (!statuses[req.params.kind]) return res.status(400).json({ success: false, message: 'Unknown record type' });
    const page = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1));
    const limit = 50;
    const filter = { state: req.departmentState, kind: req.params.kind };
    if (req.query.status) filter.status = String(req.query.status);
    if (req.query.q) filter.title = new RegExp(escapeRegex(String(req.query.q).slice(0, 100)), 'i');
    const [records, total] = await Promise.all([Record.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Record.countDocuments(filter)]);
    res.json({ success: true, records, total, page, limit });
  } catch (e) { next(e); }
});
router.post('/records/:kind', async (req, res, next) => {
  try {
    let data; try { data = validateRecord(req.params.kind, req.body); } catch (e) { return res.status(400).json({ success: false, message: e.message }); }
    const now = new Date();
    if (req.params.kind === 'advisories' && data.status === 'published') data.publishedAt = now;
    if (req.params.kind === 'cases' && ['referred', 'responding', 'resolved'].includes(data.status)) data.firstResponseAt = now;
    if (data.status === 'resolved') data.resolvedAt = now;
    const record = await Record.create({ ...data, kind: req.params.kind, state: req.departmentState, createdBy: req.user._id, updatedBy: req.user._id });
    res.status(201).json({ success: true, record });
  } catch (e) { if (e.name === 'ValidationError') return res.status(400).json({ success: false, message: e.message }); next(e); }
});
router.put('/records/:kind/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id) || !statuses[req.params.kind]) return res.status(400).json({ success: false, message: 'Invalid record' });
    const record = await Record.findOne({ _id: req.params.id, kind: req.params.kind, state: req.departmentState });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found in your jurisdiction' });
    let data; try { data = validateRecord(req.params.kind, req.body); } catch (e) { return res.status(400).json({ success: false, message: e.message }); }
    // Full form updates clear removed optional fields; ownership and scope stay server-controlled.
    const { createdAt, updatedAt, createdBy, state, kind, _id, __v, publishedAt, firstResponseAt, resolvedAt, ...previous } = record.toObject();
    for (const key of Object.keys(previous)) if (data[key] === undefined) record.set(key, undefined);
    Object.assign(record, data, { updatedBy: req.user._id });
    if (data.status === 'published' && !record.publishedAt) record.publishedAt = new Date();
    if (record.kind === 'cases' && ['referred', 'responding', 'resolved'].includes(data.status) && !record.firstResponseAt) record.firstResponseAt = new Date();
    if (data.status === 'resolved' && !record.resolvedAt) record.resolvedAt = new Date();
    await record.save(); res.json({ success: true, record });
  } catch (e) { if (e.name === 'ValidationError') return res.status(400).json({ success: false, message: e.message }); next(e); }
});
module.exports = router;
