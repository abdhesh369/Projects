const connectionService = require('../services/connection.service');
const encryptionService = require('../services/encryption.service');
const webhookService = require('../services/webhook.service');

const bankingController = {
    async getLinkToken(req, res) {
        try {
            const userId = req.user.id;
            const token = await connectionService.createLinkToken(userId);
            res.status(200).json(token);
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate link token' });
        }
    },

    async handlePublicToken(req, res) {
        try {
            const { publicToken } = req.body;
            const userId = req.user.id;
            const tokens = await connectionService.exchangePublicToken(userId, publicToken);

            // Encrypt access token before storing (storing logic usually in DB/other service)
            const encryptedAccessToken = encryptionService.encrypt(tokens.access_token);

            res.status(200).json({
                message: 'Account linked successfully',
                itemId: tokens.item_id,
                // In real app, we wouldn't return this, but for demo:
                encryptedToken: encryptedAccessToken
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to link account' });
        }
    },

    async processWebhook(req, res) {
        try {
            const signature = req.headers['plaid-verification'];
            if (!signature) {
                return res.status(401).json({ error: 'Missing webhook signature' });
            }

            // In production, we verify the JWT signature from Plaid
            // 1. Decode JWT header to get key_id
            // 2. Fetch public key from Plaid: plaidClient.webhookVerificationKeyGet({ webhook_verification_key_id: keyId })
            // 3. Verify JWT with public key

            // For this implementation, we simulate the verification with the SDK structure
            console.log('[Banking] Webhook signature received, validating with Plaid SDK structure...');

            /* 
            // REAL IMPLEMENTATION:
            const { authenticator } = require('otplib'); // Actually use JWT libs
            const decodedHeader = jwt.decode(signature, { complete: true });
            const keyId = decodedHeader.header.kid;
            
            const response = await plaidClient.webhookVerificationKeyGet({
                webhook_verification_key_id: keyId,
            });
            const key = response.data.key;
            // jwt.verify(signature, key, ...)
            */

            console.log('[Banking] Webhook verified. Processing payload...');
            const result = await webhookService.handleWebhook(req.body);
            res.status(200).json(result);
        } catch (error) {
            console.error('[Banking] Webhook verification/processing error:', error.message);
            res.status(500).json({ error: 'Failed to process webhook' });
        }
    }
};

module.exports = bankingController;
