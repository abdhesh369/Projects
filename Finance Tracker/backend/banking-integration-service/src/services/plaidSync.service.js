const logger = require('../../../shared/utils/logger');
const plaidClient = require('../integrations/plaid.integration');
const axios = require('axios');

const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3009';
const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

const plaidSyncService = {
    /**
     * Fetch accounts from Plaid for a given access_token and push them
     * to the account-service.
     */
    async syncAccounts(accessToken, userId) {
        logger.info(`[PlaidSync] Syncing accounts for user ${userId}`);
        try {
            const response = await plaidClient.accountsGet({
                access_token: accessToken,
            });

            const accounts = response.data.accounts.map(acct => ({
                plaid_account_id: acct.account_id,
                name: acct.name,
                official_name: acct.official_name,
                type: acct.type,
                subtype: acct.subtype,
                mask: acct.mask,
                current_balance: acct.balances.current,
                available_balance: acct.balances.available,
                currency: acct.balances.iso_currency_code || 'USD',
                user_id: userId,
            }));

            // Push to account-service
            await axios.post(`${ACCOUNT_SERVICE_URL}/sync`, {
                userId,
                accounts,
            }, {
                headers: { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN }
            });

            logger.info(`[PlaidSync] Synced ${accounts.length} accounts for user ${userId}`);
            return accounts;
        } catch (error) {
            logger.error('[PlaidSync] Error syncing accounts:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    /**
     * Fetch transactions from Plaid for a given access_token and push them
     * to the transaction-service.
     * Uses the Plaid transactions/sync endpoint for incremental updates.
     */
    async syncTransactions(accessToken, userId, cursor = null) {
        logger.info(`[PlaidSync] Syncing transactions for user ${userId}`);
        const allAdded = [];
        const allModified = [];
        const allRemoved = [];
        let hasMore = true;
        let nextCursor = cursor || '';

        try {
            while (hasMore) {
                const request = {
                    access_token: accessToken,
                    cursor: nextCursor,
                };
                const response = await plaidClient.transactionsSync(request);
                const data = response.data;

                allAdded.push(...data.added);
                allModified.push(...data.modified);
                allRemoved.push(...data.removed);

                hasMore = data.has_more;
                nextCursor = data.next_cursor;
            }

            const formattedTransactions = allAdded.map(txn => ({
                plaid_transaction_id: txn.transaction_id,
                account_id: txn.account_id,
                amount: txn.amount,
                date: txn.date,
                name: txn.name,
                merchant_name: txn.merchant_name,
                category: txn.personal_finance_category ? txn.personal_finance_category.primary : (txn.category ? txn.category[0] : 'Uncategorized'),
                pending: txn.pending,
                currency: txn.iso_currency_code || 'USD',
                user_id: userId,
            }));

            // Push to transaction-service
            await axios.post(`${TRANSACTION_SERVICE_URL}/sync`, {
                userId,
                added: formattedTransactions,
                modified: allModified.map(txn => ({
                    plaid_transaction_id: txn.transaction_id,
                    amount: txn.amount,
                    name: txn.name,
                    pending: txn.pending,
                    user_id: userId,
                })),
                removed: allRemoved.map(txn => ({
                    plaid_transaction_id: txn.transaction_id,
                })),
                cursor: nextCursor,
            }, {
                headers: { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN }
            });

            logger.info(`[PlaidSync] Synced ${formattedTransactions.length} added, ${allModified.length} modified, ${allRemoved.length} removed transactions for user ${userId}`);
            return {
                added: formattedTransactions.length,
                modified: allModified.length,
                removed: allRemoved.length,
                cursor: nextCursor,
            };
        } catch (error) {
            logger.error('[PlaidSync] Error syncing transactions:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
};

module.exports = plaidSyncService;
