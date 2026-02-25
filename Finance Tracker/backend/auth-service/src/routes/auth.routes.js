const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.get('/sessions', authController.getSessions);
router.post('/mfa/setup', authController.setupMFA);
router.post('/mfa/verify', authController.verifyMFA);
router.post('/mfa/disable', authController.disableMFA);

module.exports = router;
