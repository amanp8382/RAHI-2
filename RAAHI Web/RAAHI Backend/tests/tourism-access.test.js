const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const express = require('express');
const mongoose = require('mongoose');
const { authorize } = require('../middleware/auth');
const helpers = require('../utils/tourism');
const id = new mongoose.Types.ObjectId();

test('department APIs enforce roles and server-selected state on reads and writes', async () => {
  const filters = []; const created = []; const userFilters = [];
  const chain = value => ({ sort() { return this; }, skip() { return this; }, limit() { return this; }, select() { return this; }, lean: async () => value });
  const Record = {
    find: filter => { filters.push(filter); return chain([]); }, countDocuments: async () => 0,
    findOne: async filter => { filters.push(filter); return null; },
    create: async data => { created.push(data); return { _id: id, ...data }; }
  };
  const context = { module: { exports: {} }, Date, RegExp, Set, Object, String, Number, parseInt,
    require: name => {
      if (name === 'express') return express;
      if (name === 'mongoose') return mongoose;
      if (name === 'express-rate-limit') return () => (req, res, next) => next();
      if (name === '../middleware/auth') return { authorize, authenticate: (req, res, next) => {
        if (!req.headers['x-role']) return res.status(401).json({ message: 'Unauthorized' });
        req.user = { _id: id, role: req.headers['x-role'], location: req.headers['x-state'] || 'Uttar Pradesh' }; next();
      }};
      if (name === '../middleware/requireAccountDatabase') return (req, res, next) => next();
      if (name === '../models/TourismRecord') return Record;
      if (name === '../models/User') return { find: filter => { userFilters.push(filter); return chain([]); }, countDocuments: async () => 0 };
      if (name === '../utils/tourism') return helpers;
      throw Error(name);
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../routes/tourism.js'), 'utf8'), context);
  const app = express(); app.use(express.json()); app.use(context.module.exports);
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { 'x-role': 'tourist_department', 'Content-Type': 'application/json' };
  try {
    assert.equal((await fetch(base + '/overview')).status, 401);
    assert.equal((await fetch(base + '/overview', { headers: { 'x-role': 'user' } })).status, 403);
    assert.equal((await fetch(base + '/overview', { headers: { 'x-role': 'police' } })).status, 403);
    assert.equal((await fetch(base + '/overview', { headers: { ...headers, 'x-state': 'Unknown' } })).status, 403);
    assert.equal((await fetch(base + '/records/destinations?state=Goa', { headers })).status, 200);
    assert.equal(filters.at(-1).state, 'Uttar Pradesh');
    assert.equal((await fetch(base + '/tourists?state=Goa', { headers })).status, 200);
    assert.equal(userFilters.at(-1).role, 'user');
    assert(userFilters.at(-1).destination.test('Agra'));
    assert(!userFilters.at(-1).destination.test('Goa'));
    const response = await fetch(base + '/records/destinations', { method: 'POST', headers, body: JSON.stringify({ title: 'Museum', state: 'Goa', createdBy: 'forged', status: 'open' }) });
    assert.equal(response.status, 201); assert.equal(created[0].state, 'Uttar Pradesh'); assert.equal(created[0].createdBy.toString(), id.toString());
    const edit = await fetch(base + '/records/destinations/' + id, { method: 'PUT', headers, body: JSON.stringify({ title: 'Other state record' }) });
    assert.equal(edit.status, 404); assert.equal(filters.at(-1).state, 'Uttar Pradesh');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
