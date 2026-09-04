const express = require('express');
const publicController = require('../controllers/publicController');

const router = express.Router();

router.get('/career-connect/creators', publicController.listCreators);
router.get('/career-connect/creators/:id', publicController.getCreator);

module.exports = router;
