const logger = require('../../../shared/utils/logger');

/**
 * Yodlee Integration Client Stub
 * In a real-world scenario, this would use the Yodlee SDK to communicate with their API.
 */
const yodleeClient = {
    async getAccounts(userId) {
        logger.info(`Fetching Yodlee accounts for user ${userId}`);
        return [];
    },

    async syncTransactions(accountId) {
        logger.info(`Syncing Yodlee transactions for account ${accountId}`);
        return { success: true, count: 0 };
    }
};

module.exports = yodleeClient;
