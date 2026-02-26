const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../../../shared/utils/request-validator');

const updateProfileSchema = {
    firstName: { type: 'string', required: true, minLength: 2 },
    lastName: { type: 'string', required: true, minLength: 2 }
};

const updatePreferencesSchema = {
    currency: { type: 'string' },
    theme: { type: 'string' },
    notifications: { type: 'object' }
};

// Basic info
router.get('/me', authMiddleware, userController.getMe);
router.put('/profile', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.put('/preferences', authMiddleware, validate(updatePreferencesSchema), userController.updatePreferences);

// Subscription routes (Fixed Routing)
router.get('/subscription', billingController.getSubscriptions);
router.post('/subscription/checkout', billingController.createCheckout);
router.post('/subscription/portal', billingController.createPortal);
router.get('/subscription/billing', billingController.getInvoices);

module.exports = router;
