const logger = require('../../../shared/utils/logger');
const axios = require('axios');

const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3009';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

const webhookService = {
    async handleWebhook(payload) {
        logger.info(`[Banking] Received Webhook: ${payload.webhook_type}`);

        switch (payload.webhook_type) {
            case 'TRANSACTIONS':
                logger.info(`[Banking] Handling transaction update for item ${payload.item_id}`);
                try {
                    // Notify transaction-service to sync
                    await axios.post(`${TRANSACTION_SERVICE_URL}/sync`, {
                        itemId: payload.item_id,
                        userId: payload.user_id // Note: user_id might come from mapping in DB
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
