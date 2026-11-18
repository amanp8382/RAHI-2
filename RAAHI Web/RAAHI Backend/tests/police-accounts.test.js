const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const User = require('../models/User');

test('police initializer creates valid identities and preserves existing accounts', async () => {
  const saved = new Map();
  const model = {
    exists: async filter => saved.has(filter.pincode),
    create: async data => {
      const user = new User(data);
      assert.equal(user.validateSync(), undefined);
      saved.set(data.pincode, data);
    }
  };
  const context = { module: { exports: {} }, process: { env: {} }, require: () => model };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../config/migratePoliceAccounts.js'), 'utf8'), context);
  await context.module.exports();
  assert.equal(saved.size, 2);
  const first = saved.get('110001');
  assert.equal(first.password, 'police123');
  first.password = 'existing-custom-password';
  await context.module.exports();
  assert.equal(saved.size, 2);
  assert.equal(saved.get('110001').password, 'existing-custom-password');
});
