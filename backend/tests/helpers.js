const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function bootstrapTestDb() {
  const dbPath = path.join(__dirname, `test-${crypto.randomUUID()}.db`);
  process.env.DB_PATH = dbPath;
  process.env.JWT_SECRET = 'test-secret';
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_PASSWORD = 'admin123';

  const { createSchema } = require('../src/db/schema');
  const { seed } = require('../src/db/seed');
  createSchema();
  seed();

  const db = require('../src/db/connection');
  const app = require('../src/app');

  return { app, dbPath, db };
}

function cleanupTestDb(dbPath, db) {
  if (db) db.close();
  for (const suffix of ['', '-wal', '-shm']) {
    const file = dbPath + suffix;
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch {
      // Windows can briefly hold a file lock after close(); leftover test
      // db files are gitignored and harmless to skip cleaning up.
    }
  }
}

async function request(app, method, url, { body, token } = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      fetch(`http://127.0.0.1:${port}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
        .then(async (res) => {
          const json = await res.json().catch(() => null);
          server.close();
          resolve({ status: res.status, body: json });
        })
        .catch((err) => {
          server.close();
          reject(err);
        });
    });
  });
}

module.exports = { bootstrapTestDb, cleanupTestDb, request };
