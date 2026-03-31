const express = require('express');
const router = express.Router();
const { getActiveWeek, createWeek, submitWeek } = require('../controllers/week.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createWeekValidator } = require('../validators/week.validator');

router.get('/active', protect, getActiveWeek);
router.post('/', protect, authorize('coordinator', 'admin'), createWeekValidator, createWeek);
router.patch('/:id/submit', protect, authorize('coordinator', 'admin'), submitWeek);

module.exports = router;
