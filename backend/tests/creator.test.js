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

test('application with missing required fields is rejected', async () => {
  const res = await request(app, 'POST', '/api/creators/apply', { body: { name: 'Incomplete' } });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
});

test('valid application becomes PENDING_VERIFICATION and returns a token', async () => {
  const res = await request(app, 'POST', '/api/creators/apply', {
    body: {
      name: 'Test Creator',
      email: 'test.creator@example.com',
      linkedin_url: 'https://linkedin.com/in/test-creator',
      current_status: 'NOT_WORKING',
      years_experience: 2,
      description: 'Testing creator application flow.',
    },
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.creator.status, 'PENDING_VERIFICATION');
  assert.ok(res.body.data.token);
});

test('creator can add multiple services, each with independent price/duration', async () => {
  const applyRes = await request(app, 'POST', '/api/creators/apply', {
    body: {
      name: 'Multi Service Creator',
      email: 'multi.service@example.com',
      linkedin_url: 'https://linkedin.com/in/multi-service',
      current_status: 'NOT_WORKING',
      years_experience: 5,
      description: 'Offers multiple services.',
    },
  });
  const { token, creator } = applyRes.body.data;

  const svc1 = await request(app, 'POST', `/api/creators/${creator.id}/services`, {
    token,
    body: {
      category: 'RESUME_REVIEW', name: 'Resume Review', description: 'desc',
      price: 300, meeting_required: false, delivery_time: '48 hours',
    },
  });
  const svc2 = await request(app, 'POST', `/api/creators/${creator.id}/services`, {
    token,
    body: {
      category: 'MOCK_INTERVIEW', name: 'Mock Interview', description: 'desc',
      price: 900, duration_minutes: 60, meeting_required: true,
      availability: [{ weekday: 'MON', start_time: '18:00', end_time: '19:00' }],
    },
  });

  assert.strictEqual(svc1.status, 201);
  assert.strictEqual(svc2.status, 201);
  assert.strictEqual(svc1.body.data.service.price, 300);
  assert.strictEqual(svc2.body.data.service.price, 900);
  assert.strictEqual(svc1.body.data.service.meeting_required, false);
  assert.strictEqual(svc2.body.data.service.meeting_required, true);
  assert.strictEqual(svc2.body.data.service.availability.length, 1);
});

test('meeting_required=true without availability is rejected', async () => {
  const applyRes = await request(app, 'POST', '/api/creators/apply', {
    body: {
      name: 'Bad Availability Creator',
      email: 'bad.availability@example.com',
      linkedin_url: 'https://linkedin.com/in/bad-availability',
      current_status: 'NOT_WORKING',
      years_experience: 1,
      description: 'Testing bad availability.',
    },
  });
  const { token, creator } = applyRes.body.data;

  const res = await request(app, 'POST', `/api/creators/${creator.id}/services`, {
    token,
    body: { category: 'CONSULTATION', name: 'Call', description: 'desc', price: 500, meeting_required: true },
  });
  assert.strictEqual(res.status, 400);
});

test('meeting_required=false without delivery_time is rejected', async () => {
  const applyRes = await request(app, 'POST', '/api/creators/apply', {
    body: {
      name: 'Bad Delivery Creator',
      email: 'bad.delivery@example.com',
      linkedin_url: 'https://linkedin.com/in/bad-delivery',
      current_status: 'NOT_WORKING',
      years_experience: 1,
      description: 'Testing bad delivery time.',
    },
  });
  const { token, creator } = applyRes.body.data;

  const res = await request(app, 'POST', `/api/creators/${creator.id}/services`, {
    token,
    body: { category: 'RESUME_REVIEW', name: 'Review', description: 'desc', price: 300, meeting_required: false },
  });
  assert.strictEqual(res.status, 400);
});

test('a creator cannot modify another creator profile', async () => {
  const a = await request(app, 'POST', '/api/creators/apply', {
    body: {
      name: 'Creator A', email: 'creator.a@example.com', linkedin_url: 'https://linkedin.com/in/creator-a',
      current_status: 'NOT_WORKING', years_experience: 1, description: 'A',
    },
  });
  const b = await request(app, 'POST', '/api/creators/apply', {
    body: {
      name: 'Creator B', email: 'creator.b@example.com', linkedin_url: 'https://linkedin.com/in/creator-b',
      current_status: 'NOT_WORKING', years_experience: 1, description: 'B',
    },
  });

  const res = await request(app, 'PUT', `/api/creators/${a.body.data.creator.id}`, {
    token: b.body.data.token,
    body: { description: 'hijacked' },
  });
  assert.strictEqual(res.status, 403);
});
