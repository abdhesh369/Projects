const logger = require('../../../shared/utils/logger');
const plaidClient = require('../integrations/plaid.integration');

const connectionService = {
    async createLinkToken(userId) {
        logger.info(`[Banking] Creating Link Token for user ${userId}`);

        try {
            const configs = {
                user: {
                    client_user_id: userId.toString(),
                },
                client_name: 'Finance Tracker',
                products: ['transactions'],
                country_codes: ['US'], // Default to US
                language: 'en',
            };

            const result = await plaidClient.linkTokenCreate(configs);
            return {
                link_token: result.data.link_token,
                expiration: result.data.expiration
            };
        } catch (error) {
            logger.error('[Banking] Error creating link token:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async exchangePublicToken(userId, publicToken) {
        logger.info(`[Banking] Exchanging public token for user ${userId}`);

        try {
            const response = await plaidClient.itemPublicTokenExchange({
                public_token: publicToken,
            });

            return {
                access_token: response.data.access_token,
                item_id: response.data.item_id
            };
        } catch (error) {
            logger.error('[Banking] Error exchanging public token:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

module.exports = connectionService;
