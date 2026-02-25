const transactionService = require('./transaction.service');
const duplicateDetectionService = require('./duplicate-detection.service');

/**
 * Service to handle bulk import of transactions from external sources
 */
const importService = {
    /**
     * Imports a list of transactions for a user
     * @param {string} userId 
     * @param {Array} transactions 
     * @returns {Object} result summary
     */
    async importTransactions(userId, transactions) {
        const results = {
            total: transactions.length,
            imported: 0,
            skipped: 0,
            duplicates: []
        };

        // Fetch recent transactions for duplicate detection
        // Using a reasonable window of 100 transactions
        const { transactions: history } = await transactionService.getTransactions(userId, { limit: 100 });

        for (const txn of transactions) {
            // Check for duplicates
            if (duplicateDetectionService.isLikelyDuplicate(txn, history)) {
                results.skipped++;
                results.duplicates.push(txn);
                continue;
            }

            try {
                // addTransaction handles categorization automatically
                await transactionService.addTransaction({ ...txn, userId });
                results.imported++;
            } catch (error) {
                console.error(`Import failed for transaction: ${txn.description}`, error);
                results.skipped++;
            }
        }

        return results;
    }
};

module.exports = importService;
