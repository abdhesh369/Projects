const connectionService = require('../services/connection.service');
const encryptionService = require('../services/encryption.service');
const webhookService = require('../services/webhook.service');

const bankingController = {
    async getLinkToken(req, res) {
        try {
            const userId = req.query.userId;
            const token = await connectionService.createLinkToken(userId);
            res.status(200).json(token);
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate link token' });
        }
    },

    async handlePublicToken(req, res) {
        try {
            const { userId, publicToken } = req.body;
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
            const result = await webhookService.handleWebhook(req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to process webhook' });
        }
    }
};

module.exports = bankingController;
