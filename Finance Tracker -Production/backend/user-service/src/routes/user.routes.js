const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.put('/profile', userController.updateProfile);
router.put('/preferences', userController.updatePreferences);

module.exports = router;
