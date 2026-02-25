const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.put('/profile', userController.updateProfile);
router.put('/preferences', userController.updatePreferences);

// Subscription routes
router.get('/subscription', userController.getSubscription);
router.post('/subscription/checkout', userController.createCheckout);
router.post('/subscription/portal', userController.createPortal);
router.get('/subscription/billing', userController.getBillingHistory);

module.exports = router;
