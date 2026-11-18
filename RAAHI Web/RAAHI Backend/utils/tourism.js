const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry', 'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli and Daman and Diu'];
const aliases = { up: 'Uttar Pradesh', mh: 'Maharashtra', rj: 'Rajasthan', kl: 'Kerala', ga: 'Goa', hp: 'Himachal Pradesh', tn: 'Tamil Nadu', ka: 'Karnataka', wb: 'West Bengal', gj: 'Gujarat' };
function stateFor(user) {
  const value = String(user.departmentState || user.location || '').trim().toLowerCase();
  return STATES.find(state => state.toLowerCase() === value) || aliases[value] || null;
}
const statuses = {
  destinations: ['open', 'limited access', 'closed', 'archived'],
  advisories: ['draft', 'published', 'withdrawn', 'archived'],
  complaints: ['new', 'assigned', 'in progress', 'resolved', 'archived'],
  cases: ['open', 'referred', 'responding', 'resolved', 'archived'],
  services: ['pending verification', 'approved', 'suspended', 'archived']
};
const fields = {
  destinations: ['category', 'openingHours', 'entryFee', 'facilities', 'accessibility', 'lat', 'lng', 'dailyCapacity'],
  advisories: ['severity', 'source', 'sourceUrl', 'verified', 'expiresAt'],
  complaints: ['rating', 'channel', 'assignee', 'resolution', 'reference'],
  cases: ['caseType', 'assignee', 'reference', 'referredTo', 'resolution'],
  services: ['serviceType', 'phone', 'address', 'website', 'verified', 'source']
};
const stringLimits = { title: 160, description: 4000, city: 120, district: 120, category: 80, openingHours: 200, facilities: 1200, accessibility: 1200, source: 500, sourceUrl: 1000, channel: 100, assignee: 160, resolution: 2000, reference: 120, referredTo: 160, phone: 40, address: 1000, website: 1000 };
function validateRecord(kind, body) {
  if (!statuses[kind]) throw new Error('Unknown record type');
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid record');
  const result = {};
  for (const key of ['title', 'description', 'city', 'district', 'status', ...fields[kind]]) {
    const value = body[key];
    if (value === undefined || value === '') continue;
    if (key === 'verified') {
      if (typeof value !== 'boolean') throw new Error('Verification must be true or false');
      result[key] = value;
    } else if (['entryFee', 'lat', 'lng', 'rating', 'dailyCapacity'].includes(key)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${key} must be a number`);
      result[key] = value;
    } else if (key === 'expiresAt') {
      if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('Invalid expiry date');
      result[key] = new Date(value);
    } else {
      if (typeof value !== 'string') throw new Error(`${key} must be text`);
      const text = value.trim();
      if (text.length > (stringLimits[key] || 160)) throw new Error(`${key} is too long`);
      result[key] = text;
    }
  }
  if (!result.title) throw new Error('Title is required');
  result.status = result.status || statuses[kind][0];
  if (!statuses[kind].includes(result.status)) throw new Error('Invalid status');
  for (const key of ['sourceUrl', 'website']) if (result[key] && !/^https?:\/\/[^\s]+$/i.test(result[key])) throw new Error(`${key} must use http or https`);
  if (result.entryFee < 0 || (result.rating != null && (!Number.isInteger(result.rating) || result.rating < 1 || result.rating > 5)) || (result.dailyCapacity != null && (!Number.isInteger(result.dailyCapacity) || result.dailyCapacity < 1))) throw new Error('Invalid fee, rating or capacity');
  if ((result.lat == null) !== (result.lng == null) || Math.abs(result.lat || 0) > 90 || Math.abs(result.lng || 0) > 180) throw new Error('Provide a valid latitude and longitude together');
  if (kind === 'advisories') {
    result.severity = result.severity || 'information';
    if (!['information', 'watch', 'urgent'].includes(result.severity)) throw new Error('Invalid advisory severity');
    if (result.status === 'published' && (!result.verified || !result.source)) throw new Error('Publishing requires a verified source');
    if (result.status === 'published' && result.expiresAt && result.expiresAt <= new Date()) throw new Error('Published advisory expiry must be in the future');
  }
  if (kind === 'cases') {
    result.caseType = result.caseType || 'travel assistance';
    if (!['police', 'medical', 'travel assistance'].includes(result.caseType)) throw new Error('Invalid case type');
    if (['referred', 'responding'].includes(result.status) && !result.referredTo) throw new Error('Enter the receiving unit for a referral');
  }
  if (kind === 'services') {
    result.serviceType = result.serviceType || 'help centre';
    if (!['guide', 'hotel', 'transport', 'help centre'].includes(result.serviceType)) throw new Error('Invalid service type');
    if (result.status === 'approved' && (!result.verified || !result.source)) throw new Error('Approval requires verification evidence');
  }
  if (['cases', 'complaints'].includes(kind) && result.status === 'resolved' && !result.resolution) throw new Error('Enter a resolution before closing');
  if (kind === 'complaints' && result.status === 'assigned' && !result.assignee) throw new Error('Choose an assignee');
  return result;
}
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, match => String.fromCharCode(92) + match);
function csv(rows) {
  return rows.map(row => row.map(value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }).join(',')).join('\r\n');
}
function buildMetrics(users, records, now = new Date()) {
  const destinations = new Map(); const months = new Map();
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    months.set(date.toISOString().slice(0, 7), 0);
  }
  let durationTotal = 0, durationCount = 0, recentGPS = 0;
  const grid = new Map();
  for (const user of users) {
    const dest = user.destination || 'Not specified'; destinations.set(dest, (destinations.get(dest) || 0) + 1);
    if (user.tripDurationDays > 0) { durationTotal += user.tripDurationDays; durationCount++; }
    if (user.createdAt) { const month = new Date(user.createdAt).toISOString().slice(0, 7); if (months.has(month)) months.set(month, months.get(month) + 1); }
    const p = user.liveLocation; const age = p?.updatedAt ? now.getTime() - new Date(p.updatedAt).getTime() : Infinity;
    if (p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && age >= 0 && age <= 120000) {
      recentGPS++;
      const key = `${(Math.floor(p.lat * 10) / 10).toFixed(1)},${(Math.floor(p.lng * 10) / 10).toFixed(1)}`;
      grid.set(key, (grid.get(key) || 0) + 1);
    }
  }
  const complaints = records.filter(r => r.kind === 'complaints' && r.status !== 'archived');
  const cases = records.filter(r => r.kind === 'cases' && r.status !== 'archived');
  const ratings = complaints.filter(r => Number.isFinite(r.rating));
  const responseTimes = cases.filter(r => r.firstResponseAt && r.createdAt && new Date(r.firstResponseAt) >= new Date(r.createdAt)).map(r => (new Date(r.firstResponseAt) - new Date(r.createdAt)) / 60000);
  return {
    registrations: users.length, recentGPS, averageTripDays: durationCount ? +(durationTotal / durationCount).toFixed(1) : null,
    averageRating: ratings.length ? +(ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : null,
    openComplaints: complaints.filter(r => r.status !== 'resolved').length, resolvedComplaints: complaints.filter(r => r.status === 'resolved').length,
    openCases: cases.filter(r => r.status !== 'resolved').length,
    averageResponseMinutes: responseTimes.length ? +(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1) : null,
    destinations: records.filter(r => r.kind === 'destinations' && r.status !== 'archived').length,
    activeAdvisories: records.filter(r => r.kind === 'advisories' && r.status === 'published' && (!r.expiresAt || new Date(r.expiresAt) > now)).length,
    approvedServices: records.filter(r => r.kind === 'services' && r.status === 'approved').length,
    popularDestinations: [...destinations].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count })),
    monthlyRegistrations: [...months].map(([month, count]) => ({ month, count })),
    crowdCells: [...grid].filter(([, count]) => count >= 3).map(([cell, count]) => ({ cell, count })),
    suppressedCrowdCells: [...grid].filter(([, count]) => count < 3).length
  };
}
module.exports = { stateFor, statuses, validateRecord, escapeRegex, csv, buildMetrics };

const citiesByState = {
  'Uttar Pradesh': ['Agra', 'Lucknow', 'Varanasi', 'Ayodhya', 'Mathura', 'Prayagraj'],
  Maharashtra: ['Mumbai', 'Pune', 'Nashik', 'Nagpur'], Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer'],
  Kerala: ['Kochi', 'Munnar', 'Thiruvananthapuram', 'Alappuzha'], Goa: ['Panaji', 'Margao'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala'], 'Tamil Nadu': ['Chennai', 'Madurai', 'Coimbatore'],
  Karnataka: ['Bengaluru', 'Bangalore', 'Mysuru', 'Mysore'], 'West Bengal': ['Kolkata', 'Darjeeling'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'], Delhi: ['New Delhi']
};
module.exports.destinationPattern = state => new RegExp(`^(?:${[state, ...(citiesByState[state] || [])].map(escapeRegex).join('|')})(?:, ?(?:${escapeRegex(state)}|India))?(?:, ?India)?$`, 'i');

module.exports.STATES = STATES;
