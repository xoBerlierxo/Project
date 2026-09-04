const authService = require('../services/authService');
const { requireFields } = require('../utils/validators');
const { ok } = require('../utils/response');

function login(req, res) {
  requireFields(req.body, ['email', 'password']);
  const result = authService.login(req.body.email, req.body.password);
  ok(res, result);
}

module.exports = { login };
