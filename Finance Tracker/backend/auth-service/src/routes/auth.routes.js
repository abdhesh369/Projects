const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../../../shared/utils/request-validator');
const { loginLimiter, passwordResetLimiter } = require('../middleware/rate-limiter');

const registerSchema = {
    email: { type: 'string', required: true, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: 'string', required: true, minLength: 8 },
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true }
};

const loginSchema = {
    email: { type: 'string', required: true },
    password: { type: 'string', required: true }
};

const forgotPasswordSchema = {
    email: { type: 'string', required: true, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
};

const resetPasswordSchema = {
    token: { type: 'string', required: true },
    newPassword: { type: 'string', required: true, minLength: 8 }
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.get('/sessions', authController.getSessions);
router.post('/mfa/setup', authController.setupMFA);
router.post('/mfa/verify', validate({ code: { type: 'string', required: true, minLength: 6, maxLength: 6 } }), authController.verifyMFA);
router.post('/mfa/disable', authController.disableMFA);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
