const logger = require('../../../shared/utils/logger');
const plaidSyncService = require('../services/plaidSync.service');
const encryptionService = require('../services/encryption.service');

/**
 * Sync worker that can be called on-demand or scheduled.
 * In production, this would be triggered by Plaid webhooks or a cron job.
 */
const syncWorker = {
    /**
     * Run a full sync for a given user's linked item.
     * @param {string} encryptedAccessToken - The encrypted Plaid access token
     * @param {string} userId - The user ID
     * @param {string|null} cursor - The last sync cursor for incremental transaction sync
     */
    async runFullSync(encryptedAccessToken, userId, cursor = null) {
        logger.info(`[SyncWorker] Starting full sync for user ${userId}`);

        try {
            const accessToken = encryptionService.decrypt(encryptedAccessToken);

            // 1. Sync accounts
            const accounts = await plaidSyncService.syncAccounts(accessToken, userId);
            logger.info(`[SyncWorker] Account sync complete: ${accounts.length} accounts`);

            // 2. Sync transactions
            const txnResult = await plaidSyncService.syncTransactions(accessToken, userId, cursor);
            logger.info(`[SyncWorker] Transaction sync complete: +${txnResult.added} ~${txnResult.modified} -${txnResult.removed}`);

            return {
                success: true,
                accounts: accounts.length,
                transactions: txnResult,
            };
        } catch (error) {
            logger.error(`[SyncWorker] Sync failed for user ${userId}:`, error.message);
            return { success: false, error: error.message };
        }
    }
};

module.exports = syncWorker;
