const express = require('express');
const router = express.Router();
const { login, googleAuth } = require('../controllers/auth.controller');
const { loginValidator, googleAuthValidator } = require('../validators/auth.validator');

router.post('/login', loginValidator, login);
router.post('/google', googleAuthValidator, googleAuth);

module.exports = router;
