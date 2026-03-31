const express = require('express');
const router = express.Router();
const { getUsers, createUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createUserValidator } = require('../validators/user.validator');

router.get('/', protect, getUsers);
router.post('/', protect, authorize('admin'), createUserValidator, createUser);

module.exports = router;
