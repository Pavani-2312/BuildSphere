const express = require('express');
const router = express.Router();
const { getSectionStatuses, updateSectionStatus } = require('../controllers/status.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getSectionStatuses);
router.patch('/', protect, updateSectionStatus);

module.exports = router;
