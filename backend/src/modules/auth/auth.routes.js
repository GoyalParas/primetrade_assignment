const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const { registerSchema, loginSchema } = require('./auth.schema');

const router = express.Router();

// Public routes with rate limiters and schemas validation
router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refresh);

// Protected routes (requires valid access token)
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
