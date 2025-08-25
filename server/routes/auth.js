
// server/routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);
router.get('/meta/connect', authenticateToken, authController.getMetaAuthUrl);
router.get('/meta/callback', authController.handleMetaCallback);

module.exports = router;
