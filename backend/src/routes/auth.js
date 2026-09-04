const express = require('express');
const authController = require('../controllers/authController');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/login', loginLimiter, authController.login);

module.exports = router;
