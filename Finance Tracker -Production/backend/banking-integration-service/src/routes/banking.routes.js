const express = require('express');
const router = express.Router();
const bankingController = require('../controllers/banking.controller');

router.get('/link-token', bankingController.getLinkToken);
router.post('/link-token/exchange', bankingController.handlePublicToken);
router.post('/webhooks', bankingController.processWebhook);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'banking-integration-service' });
});

module.exports = router;
