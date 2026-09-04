const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { bootstrapTestDb, cleanupTestDb, request } = require('./helpers');

let app, dbPath, db, adminToken;

before(async () => {
  ({ app, dbPath, db } = bootstrapTestDb());
  const login = await request(app, 'POST', '/api/auth/login', {
    body: { email: 'admin@example.com', password: 'admin123' },
  });
  adminToken = login.body.data.token;
});

after(() => {
  cleanupTestDb(dbPath, db);
});

async function applyCreator(email) {
  return request(app, 'POST', '/api/creators/apply', {
    body: {
      name: 'Admin Test Creator', email, linkedin_url: 'https://linkedin.com/in/admin-test',
      current_status: 'NOT_WORKING', years_experience: 3, description: 'For admin workflow tests.',
    },
  });
}

test('non-admin cannot access admin endpoints', async () => {
  const applied = await applyCreator('nonadmin.test@example.com');
  const res = await request(app, 'GET', '/api/admin/creators/pending', { token: applied.body.data.token });
  assert.strictEqual(res.status, 403);
});

test('admin can approve a pending creator, making it public', async () => {
  const applied = await applyCreator('approve.test@example.com');
  const id = applied.body.data.creator.id;

  const approve = await request(app, 'POST', `/api/admin/creators/${id}/approve`, { token: adminToken });
  assert.strictEqual(approve.status, 200);
  assert.strictEqual(approve.body.data.creator.status, 'APPROVED');

  const publicView = await request(app, 'GET', `/api/career-connect/creators/${id}`);
  assert.strictEqual(publicView.status, 200);
});

test('admin can reject a pending creator, keeping it hidden', async () => {
  const applied = await applyCreator('reject.test@example.com');
  const id = applied.body.data.creator.id;

  const reject = await request(app, 'POST', `/api/admin/creators/${id}/reject`, {
    token: adminToken,
    body: { reason: 'Could not verify identity' },
  });
  assert.strictEqual(reject.body.data.creator.status, 'REJECTED');

  const publicView = await request(app, 'GET', `/api/career-connect/creators/${id}`);
  assert.strictEqual(publicView.status, 404);
});

test('admin can request changes, keeping creator hidden', async () => {
  const applied = await applyCreator('changes.test@example.com');
  const id = applied.body.data.creator.id;

  const res = await request(app, 'POST', `/api/admin/creators/${id}/request-changes`, {
    token: adminToken,
    body: { reason: 'Add more detail' },
  });
  assert.strictEqual(res.body.data.creator.status, 'CHANGES_REQUIRED');

  const publicView = await request(app, 'GET', `/api/career-connect/creators/${id}`);
  assert.strictEqual(publicView.status, 404);
});

test('admin can unpublish an approved creator', async () => {
  const applied = await applyCreator('unpublish.test@example.com');
  const id = applied.body.data.creator.id;
  await request(app, 'POST', `/api/admin/creators/${id}/approve`, { token: adminToken });

  const unpublish = await request(app, 'POST', `/api/admin/creators/${id}/unpublish`, { token: adminToken });
  assert.strictEqual(unpublish.body.data.creator.status, 'UNPUBLISHED');

  const publicView = await request(app, 'GET', `/api/career-connect/creators/${id}`);
  assert.strictEqual(publicView.status, 404);
});

test('admin actions are logged and reflected in verification/status', async () => {
  const applied = await applyCreator('audit.test@example.com');
  const id = applied.body.data.creator.id;
  await request(app, 'POST', `/api/admin/creators/${id}/approve`, { token: adminToken });

  const full = await request(app, 'GET', `/api/admin/creators/${id}`, { token: adminToken });
  assert.strictEqual(full.body.data.creator.status, 'APPROVED');
  assert.strictEqual(full.body.data.creator.verification.status, 'VERIFIED');
});
