const logger = require('../../../shared/utils/logger');
const categorizationService = require('../services/categorization.service');
const Transaction = require('../models/transaction.model');

const categorizationWorker = {
    async processPending() {
        try {
            // Find transactions without categories or with 'Uncategorized'
            const transactions = await Transaction.findUncategorized();

            for (const tx of transactions) {
                try {
                    const category = categorizationService.categorize(tx.description);
                    if (category && category !== 'Uncategorized') {
                        await Transaction.update(tx.id, tx.user_id, { category });
                        logger.info(`Auto-categorized transaction ${tx.id} as ${category}`);
                    }
                } catch (err) {
                    logger.error(`Error auto-categorizing transaction ${tx.id}:`, err);
                }
            }
        } catch (error) {
            logger.error('Categorization worker error:', error);
        }
    }
};

// Run periodically
setInterval(() => categorizationWorker.processPending(), 60000); // Every minute

module.exports = categorizationWorker;
