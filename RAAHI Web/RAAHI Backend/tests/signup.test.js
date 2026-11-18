const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('unconfigured account database returns 503 immediately, with validation preserved', async () => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) return;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/api/auth/register`;
    let result = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(result.status, 400);
    const start = Date.now();
    result = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName: 'Test', lastName: 'Traveler', email: 'test@example.invalid', password: 'Testing123' }) });
    assert.equal(result.status, 503);
    assert.equal((await result.json()).code, 'ACCOUNT_DATABASE_UNAVAILABLE');
    assert(Date.now() - start < 1000);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
