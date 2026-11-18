const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const express = require('express');
const path = require('node:path');
const { authorize } = require('../middleware/auth');

test('traveler GPS writes are self-only and list access is role protected', async () => {
  let written;
  const model = {
    updateOne: async (filter, update) => { written = { filter, update }; },
    find: () => ({ sort: () => ({ limit: async () => [] }) })
  };
  const context = { module: { exports: {} }, Date, Number, require: name => {
    if (name === 'express') return express;
    if (name === 'express-rate-limit') return () => (req, res, next) => next();
    if (name === '../models/User') return model;
    if (name === '../utils/serializeUser') return value => value;
    if (name === '../middleware/requireAccountDatabase') return (req, res, next) => next();
    if (name === '../middleware/auth') return { authorize, authenticate: (req, res, next) => {
      req.user = { _id: 'self-user', travelerId: 'self-traveler', role: req.headers['x-test-role'] || 'user' }; next();
    }};
    throw Error(name);
  }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../routes/travelers.js'), 'utf8'), context);
  const app = express(); app.use(express.json()); app.use(context.module.exports);
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(base + '/me/location', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: 28, lng: 77, travelerId: 'victim', updatedAt: '2000-01-01' }) });
    assert.equal(response.status, 200);
    assert.equal(written.filter._id, 'self-user');
    assert.equal(written.update.$set.liveLocation.travelerId, undefined);
    assert(written.update.$set.liveLocation.updatedAt.getTime() > Date.now() - 10000);
    assert.equal((await fetch(base + '/')).status, 403);
    assert.equal((await fetch(base + '/', { headers: { 'x-test-role': 'police' } })).status, 200);
    const invalid = await fetch(base + '/me/location', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: 100, lng: 77 }) });
    assert.equal(invalid.status, 400);
    assert.equal((await fetch(base + '/someone-else')).status, 403);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
