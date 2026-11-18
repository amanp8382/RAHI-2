const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');

function harness(apiRegister, credentialError) {
  const store = new Map();
  const loading = [];
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useState: value => [value, next => { if (typeof next === 'boolean') loading.push(next); }],
    useEffect: () => {},
    createElement: (type, props) => ({ type, props })
  };
  const sessionStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
  const context = {
    module: { exports: {} }, console: { error() {} }, sessionStorage,
    require: name => {
      if (name === 'react') return react;
      if (name === '../services/api') return { auth: { register: apiRegister } };
      if (name === '../utils/liveLocationStore') return { clearLocationCache() {} };
      if (name === '../utils/travelerLedger') return { clearTravelerCache() {}, issueTravelerCredential: async user => {
        if (credentialError) throw credentialError;
        return { ...user, travelerId: 'TEST-TRAVELER' };
      }};
      throw Error(name);
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/contexts/AuthContext.jsx'), 'utf8');
  const compiled = esbuild.transformSync(source, { loader: 'jsx', format: 'cjs' }).code;
  vm.runInNewContext(compiled, context);
  const auth = context.module.exports.AuthProvider({ children: null }).props.value;
  return { auth, store, loading };
}
const input = { firstName: 'Test', lastName: 'Traveler', email: 'test@example.invalid', password: 'Testing123' };

test('503 reports database failure without creating a local account', async () => {
  const h = harness(async () => { throw { response: { status: 503, data: { message: 'Account database is unavailable' } } }; });
  const result = await h.auth.register(input);
  assert.equal(result.success, false);
  assert.match(result.error, /database is unavailable/);
  assert.equal(h.store.has('raahi_local_users_v1'), false);
  assert.equal(h.store.has('authToken'), false);
  assert.equal(h.loading.at(-1), false);
});
test('validation and duplicate-account responses do not create local accounts', async () => {
  for (const status of [400, 409, 429]) {
    const h = harness(async () => { throw { response: { status, data: { message: 'Rejected' } } }; });
    assert.equal((await h.auth.register(input)).success, false);
    assert.equal(h.store.has('raahi_local_users_v1'), false);
  }
});
test('network failure never falls back to browser account storage', async () => {
  const h = harness(async () => { throw new Error('network down'); });
  const result = await h.auth.register(input);
  assert.equal(result.success, false);
  assert.match(result.error, /not been saved locally/);
  assert.equal(h.store.size, 0);
});
test('online signup retains the server token', async () => {
  const h = harness(async () => ({ success: true, token: 'server-token', user: { ...input, id: 'server-user' } }));
  assert.equal((await h.auth.register(input)).success, true);
  assert.equal(h.store.get('authToken'), 'server-token');
});
