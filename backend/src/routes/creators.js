const express = require('express');
const creatorController = require('../controllers/creatorController');
const serviceRequestController = require('../controllers/serviceRequestController');
const { authenticate } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { upload } = require('../middleware/upload');

const router = express.Router();

const applyLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

router.post('/creators/apply', applyLimiter, creatorController.apply);
router.put('/creators/:id', authenticate, creatorController.updateProfile);
router.post('/creators/:id/photo', authenticate, upload.single('photo'), creatorController.uploadPhoto);

router.post('/creators/:id/services', authenticate, creatorController.createService);
router.put('/services/:id', authenticate, creatorController.updateService);
router.delete('/services/:id', authenticate, creatorController.deactivateService);

router.post('/service-requests', serviceRequestController.createRequest);

module.exports = router;
