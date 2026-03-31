const express = require('express');
const router = express.Router();
const { login, googleAuth } = require('../controllers/auth.controller');
const { loginValidator, googleAuthValidator } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/login', authLimiter, loginValidator, login);
router.post('/google', authLimiter, googleAuthValidator, googleAuth);

module.exports = router;
