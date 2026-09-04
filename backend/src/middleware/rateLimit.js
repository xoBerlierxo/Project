const { fail } = require('../utils/response');

// Minimal in-memory fixed-window rate limiter. Good enough for a
// single-process MVP demo; not meant to survive restarts or scale out.
function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return fail(res, 429, 'RATE_LIMITED', 'Too many requests, please slow down');
    }
    next();
  };
}

module.exports = { rateLimit };
