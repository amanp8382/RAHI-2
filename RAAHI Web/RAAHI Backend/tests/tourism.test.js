const test = require('node:test');
const assert = require('node:assert/strict');
const { stateFor, destinationPattern, validateRecord, csv, buildMetrics } = require('../utils/tourism');

test('department state cannot fall back to nationwide access', () => {
  assert.equal(stateFor({ location: ' UP ' }), 'Uttar Pradesh');
  assert.equal(stateFor({ location: 'Kerala' }), 'Kerala');
  assert.equal(stateFor({ location: 'Unknown Office' }), null);
  assert(destinationPattern('Uttar Pradesh').test('Agra, Uttar Pradesh, India'));
  assert(!destinationPattern('Uttar Pradesh').test('Mumbai'));
  for (const name of ['Goa', 'goa', 'Goa, India', 'Panaji, Goa']) assert(destinationPattern('Goa').test(name));
  assert(!destinationPattern('Goa').test('Kerala'));
  assert(!destinationPattern('Uttar Pradesh').test('Other Agra-like area'));
});
test('publishing and provider approval require checked source evidence', () => {
  assert.throws(() => validateRecord('advisories', { title: 'Closure', status: 'published' }), /verified source/);
  assert.throws(() => validateRecord('services', { title: 'Guide', status: 'approved', verified: true }), /verification evidence/);
  assert.equal(validateRecord('advisories', { title: 'Closure', status: 'published', verified: true, source: 'Municipal notice' }).status, 'published');
  assert.throws(() => validateRecord('advisories', { title: 'Old notice', status: 'published', verified: true, source: 'Test', expiresAt: '2000-01-01' }), /future/);
});
test('assignment and closure require a real workflow record', () => {
  assert.throws(() => validateRecord('complaints', { title: 'Issue', status: 'assigned' }), /assignee/);
  assert.throws(() => validateRecord('complaints', { title: 'Issue', status: 'resolved' }), /resolution/);
  assert.throws(() => validateRecord('cases', { title: 'Assistance', status: 'referred' }), /receiving unit/);
  assert.equal(validateRecord('cases', { title: 'Assistance', status: 'referred', referredTo: 'Local police' }).referredTo, 'Local police');
});
test('rejects invalid inputs and ignores ownership injection', () => {
  const data = validateRecord('destinations', { title: 'Museum', state: 'Goa', createdBy: 'someone', role: 'admin', entryFee: 0 });
  assert.equal(data.state, undefined); assert.equal(data.createdBy, undefined); assert.equal(data.role, undefined);
  assert.throws(() => validateRecord('destinations', { title: 'Museum', lat: 90 }), /together/);
  assert.throws(() => validateRecord('destinations', { title: 'Museum', lat: 91, lng: 77 }), /valid latitude/);
  assert.throws(() => validateRecord('complaints', { title: 'Issue', rating: 6 }), /rating/);
  assert.throws(() => validateRecord('services', { title: 'Guide', website: 'javascript:alert(1)' }), /http/);
});
test('metrics use actual records, hide small GPS groups and discard old coordinates', () => {
  const now = new Date('2026-11-19T10:00:00Z');
  const fresh = { lat: 28.61, lng: 77.21, updatedAt: now };
  const users = [1, 2, 3].map(() => ({ destination: 'Agra', tripDurationDays: 4, createdAt: now, liveLocation: fresh }));
  users.push({ destination: 'Lucknow', createdAt: now, liveLocation: { lat: 26.8, lng: 80.9, updatedAt: now } });
  users.push({ destination: 'Agra', createdAt: now, liveLocation: { ...fresh, updatedAt: new Date(now - 180000) } });
  const records = [
    { kind: 'complaints', status: 'resolved', rating: 4 }, { kind: 'complaints', status: 'new', rating: 2 },
    { kind: 'cases', status: 'responding', createdAt: new Date(now - 120000), firstResponseAt: now },
    { kind: 'advisories', status: 'published', expiresAt: new Date(now - 1000) },
    { kind: 'advisories', status: 'published', expiresAt: new Date(now.getTime() + 1000) }
  ];
  const result = buildMetrics(users, records, now);
  assert.equal(result.registrations, 5); assert.equal(result.recentGPS, 4);
  assert.equal(result.averageTripDays, 4); assert.equal(result.averageRating, 3);
  assert.equal(result.openComplaints, 1); assert.equal(result.averageResponseMinutes, 2);
  assert.equal(result.activeAdvisories, 1); assert.equal(result.crowdCells.length, 1);
  assert.equal(result.crowdCells[0].count, 3); assert.equal(result.suppressedCrowdCells, 1);
  assert.equal(result.monthlyRegistrations.length, 6);
  assert.equal(JSON.stringify(result).includes('updatedAt'), false);
});
test('empty data does not invent ratings or response times', () => {
  const result = buildMetrics([], []);
  assert.equal(result.registrations, 0); assert.equal(result.averageRating, null);
  assert.equal(result.averageResponseMinutes, null); assert.equal(result.averageTripDays, null);
});
test('CSV export quotes content and neutralizes spreadsheet formulas', () => {
  const output = csv([['=HYPERLINK("bad")', 'hello, world', 'safe'], [' @SUM(A1)', 'line\nbreak', 'quote"']]);
  assert(output.includes(String.fromCharCode(34, 39) + '=HYPERLINK('));
  assert(output.includes('"hello, world"'));
  assert(output.includes(String.fromCharCode(34, 39) + ' @SUM(A1)'));
});
