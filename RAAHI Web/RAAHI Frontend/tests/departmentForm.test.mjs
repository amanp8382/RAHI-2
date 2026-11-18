import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { statuses, formFor, payloadFor } from '../src/components/departmentConfig.js';
const require = createRequire(import.meta.url);
const backend = require('../../RAAHI Backend/utils/tourism.js');
test('department forms use the same workflow statuses as the server', () => {
  for (const kind of Object.keys(statuses)) assert.deepEqual(statuses[kind], backend.statuses[kind]);
});
test('zero fee and zero coordinates are preserved; empty numeric fields are excluded', () => {
  const payload = payloadFor('destinations', { ...formFor('destinations'), title: 'Museum', entryFee: '0', lat: '0', lng: '0', dailyCapacity: '' });
  assert.equal(payload.entryFee, 0); assert.equal(payload.lat, 0); assert.equal(payload.lng, 0);
  assert.equal(payload.dailyCapacity, undefined);
  assert.equal(backend.validateRecord('destinations', payload).entryFee, 0);
});
test('forms exclude server-controlled ownership and state from edits', () => {
  const payload = payloadFor('complaints', formFor('complaints', { title: 'Issue', _id: 'record', state: 'Goa', createdBy: 'actor', rating: 4 }));
  assert.equal(payload.state, undefined); assert.equal(payload._id, undefined); assert.equal(payload.createdBy, undefined);
  assert.equal(payload.rating, 4);
});
test('advisory expiry can be edited and verification remains explicit', () => {
  const form = formFor('advisories', { title: 'Notice', expiresAt: '2030-01-01T00:00:00.000Z', source: 'Local authority' });
  assert.equal(form.expiresAt, '2030-01-01');
  assert.equal(payloadFor('advisories', form).verified, false);
});
