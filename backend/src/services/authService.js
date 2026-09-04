const bcrypt = require('bcrypt');
const db = require('../db/connection');
const { ApiError } = require('../utils/response');
const { signToken } = require('../utils/auth');

function login(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const matches = bcrypt.compareSync(password, user.password_hash);
  if (!matches) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const token = signToken(user);
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

function findOrCreateCreatorUser(email) {
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (user) return user;

  const randomPassword = bcrypt.hashSync(require('crypto').randomUUID(), 10);
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'CREATOR')
  `).run(email, randomPassword);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
}

module.exports = { login, findOrCreateCreatorUser };
