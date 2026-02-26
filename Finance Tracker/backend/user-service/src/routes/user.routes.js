const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.put('/profile', userController.updateProfile);
router.put('/preferences', userController.updatePreferences);

// Subscription routes (Fixed Routing)
router.get('/subscription', billingController.getSubscriptions);
router.post('/subscription/checkout', billingController.createCheckout);
router.post('/subscription/portal', billingController.createPortal);
router.get('/subscription/billing', billingController.getInvoices);

module.exports = router;
