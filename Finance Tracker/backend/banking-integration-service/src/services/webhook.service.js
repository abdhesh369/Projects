const logger = require('../../../shared/utils/logger');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const plaidClient = require('../config/plaid');

const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3009';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

const webhookService = {
    async verifyWebhook(header, body) {
        try {
            if (!header) return false;

            // Decode without verification to get key ID
            const decodedToken = jwt.decode(header, { complete: true });
            if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
                logger.error('[Banking] Invalid webhook signature format');
                return false;
            }

            const kid = decodedToken.header.kid;

            // Fetch public key from Plaid
            const response = await plaidClient.webhookVerificationKeyGet({
                webhook_verification_key_id: kid
            });

            const key = response.data.key;

            // Verify JWT
            // Plaid uses ES256
            jwt.verify(header, key, { algorithms: ['ES256'] });

            return true;
        } catch (error) {
            logger.error('[Banking] Webhook verification failed:', error.message);
            return false;
        }
    },

    async handleWebhook(payload) {
        logger.info(`[Banking] Received Webhook: ${payload.webhook_type}`);

        switch (payload.webhook_type) {
            case 'TRANSACTIONS':
                logger.info(`[Banking] Handling transaction update for item ${payload.item_id}`);
                try {
                    // Notify transaction-service to sync
                    await axios.post(`${TRANSACTION_SERVICE_URL}/sync`, {
                        itemId: payload.item_id,
                        userId: payload.user_id
                    }, {
                        headers: { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN }
                    });
                    logger.info('[Banking] Transaction sync notification sent');
                } catch (error) {
                    logger.error('[Banking] Failed to notify transaction service:', error.message);
                }
                break;
            case 'ITEM':
                logger.info(`[Banking] Handling item error/update for item ${payload.item_id}`);
                break;
            default:
                logger.info(`[Banking] Unhandled webhook type: ${payload.webhook_type}`);
        }

        return { received: true };
    }
};

module.exports = webhookService;
