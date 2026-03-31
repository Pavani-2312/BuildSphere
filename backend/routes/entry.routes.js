const express = require('express');
const router = express.Router();
const { getEntries, createEntry, deleteEntry } = require('../controllers/entry.controller');
const { protect } = require('../middleware/auth.middleware');
const { createEntryValidator } = require('../validators/entry.validator');

router.get('/', protect, getEntries);
router.post('/', protect, createEntryValidator, createEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;
