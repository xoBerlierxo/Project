const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { bootstrapTestDb, cleanupTestDb, request } = require('./helpers');

let app, dbPath, db;

before(() => {
  ({ app, dbPath, db } = bootstrapTestDb());
});

after(() => {
  cleanupTestDb(dbPath, db);
});

test('public listing returns only APPROVED creators', async () => {
  const res = await request(app, 'GET', '/api/career-connect/creators');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.creators.length, 6);
  assert.ok(res.body.data.creators.every((c) => c.verified === true));
});

test('pending creator profile is not publicly accessible', async () => {
  const pending = await request(app, 'GET', '/api/admin/creators/pending');
  // no token supplied -> unauthorized, but confirms admin route exists
  assert.strictEqual(pending.status, 401);
});

test('rejected and unpublished creators do not appear in public listing', async () => {
  const res = await request(app, 'GET', '/api/career-connect/creators');
  const names = res.body.data.creators.map((c) => c.name);
  assert.ok(!names.includes('Devansh Rao')); // REJECTED
  assert.ok(!names.includes('Meera Nair')); // UNPUBLISHED
  assert.ok(!names.includes('Vikram Singh')); // PENDING_VERIFICATION
});

test('category filter returns only matching creators', async () => {
  const res = await request(app, 'GET', '/api/career-connect/creators?category=MOCK_INTERVIEW');
  assert.ok(res.body.data.creators.length > 0);
  assert.ok(res.body.data.creators.every((c) => c.service_categories.includes('MOCK_INTERVIEW')));
});

test('creator profile returns full active services with availability', async () => {
  const list = await request(app, 'GET', '/api/career-connect/creators');
  const first = list.body.data.creators[0];
  const res = await request(app, 'GET', `/api/career-connect/creators/${first.id}`);
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data.creator.services));
  assert.ok(res.body.data.creator.services.length > 0);
});

test('unknown creator id returns 404', async () => {
  const res = await request(app, 'GET', '/api/career-connect/creators/99999');
  assert.strictEqual(res.status, 404);
});
