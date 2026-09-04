const express = require('express');
const { ok } = require('../utils/response');

const router = express.Router();

router.get('/health', (req, res) => ok(res, { status: 'ok' }));

module.exports = router;
