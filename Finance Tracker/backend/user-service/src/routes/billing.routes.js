const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const authMiddleware = require('../middleware/auth');

// Stripe Webhook (must be BEFORE express.json middleware - needs raw body)
// This route is mounted separately in server.js with express.raw()
router.post('/webhook', express.raw({ type: 'application/json' }), billingController.handleWebhook);

// Protected routes
router.use(authMiddleware);
router.post('/checkout', billingController.createCheckout);
router.post('/portal', billingController.createPortal);
router.get('/subscriptions', billingController.getSubscriptions);
router.post('/subscriptions/:id/cancel', billingController.cancelSubscription);
router.post('/subscriptions/:id/resume', billingController.resumeSubscription);
router.get('/invoices', billingController.getInvoices);

module.exports = router;
