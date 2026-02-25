const express = require('express');
const router = express.Router();
const bankingController = require('../controllers/banking.controller');
const authMiddleware = require('../middleware/auth');

// Health check (Public)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'banking-integration-service' });
});

// Webhooks (Public - uses signature verification in controller)
router.post('/webhooks', bankingController.processWebhook);

// Protected routes
router.use(authMiddleware);
router.get('/link-token', bankingController.getLinkToken);
router.post('/link-token/exchange', bankingController.handlePublicToken);

module.exports = router;
