// api/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user data
router.get('/me', protect, authController.getMe);

module.exports = router;