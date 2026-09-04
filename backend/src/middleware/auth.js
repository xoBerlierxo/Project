const { verifyToken } = require('../utils/auth');
const { fail } = require('../utils/response');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'UNAUTHORIZED', 'Missing bearer token');
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return fail(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return fail(res, 403, 'FORBIDDEN', `Requires ${role} role`);
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
