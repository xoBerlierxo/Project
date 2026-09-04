const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/creators/pending', adminController.listPending);
router.get('/creators/approved', adminController.listApproved);
router.get('/creators/rejected', adminController.listRejected);
router.get('/creators/:id', adminController.getCreator);

router.post('/creators/:id/approve', adminController.approve);
router.post('/creators/:id/reject', adminController.reject);
router.post('/creators/:id/request-changes', adminController.requestChanges);
router.post('/creators/:id/unpublish', adminController.unpublish);

module.exports = router;
