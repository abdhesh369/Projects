const logger = require('../../../shared/utils/logger');
const Account = require('../models/account.model');

const syncService = {
    async syncAccount(accountId, userId) {
        try {
            logger.info(`Starting sync for account ${accountId}`);

            const account = await Account.findByIdAndUserId(accountId, userId);
            if (!account) throw new Error('Account not found');

            // In a real app, this would call Plaid API to fetch latest transactions
            // and update the account balance accordingly.
            // For now, we simulate a successful sync.

            await Account.update(accountId, userId, {
                updated_at: new Date()
            });

            logger.info(`Sync completed for account ${accountId}`);
            return { success: true, lastSync: new Date() };
        } catch (error) {
            logger.error(`Error syncing account ${accountId}:`, error);
            throw error;
        }
    }
};

module.exports = syncService;
