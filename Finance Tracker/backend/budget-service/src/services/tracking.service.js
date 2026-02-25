const logger = require('../../../shared/utils/logger');
const budgetService = require('./budget.service');

/**
 * Tracking Service
 * Tracks progress against budget goals over time
 */
const trackingService = {
    /**
     * Generates a tracking summary for all user budgets
     * @param {string} userId 
     * @returns {Object} Tracking summary
     */
    async getBudgetTrackingSummary(userId) {
        try {
            const budgets = await budgetService.getUserBudgets(userId);

            let totalBudgeted = 0;
            let totalSpent = 0;

            const trackingDetails = budgets.map(b => {
                totalBudgeted += parseFloat(b.amount);
                totalSpent += parseFloat(b.current_spending);

                return {
                    budgetId: b.id,
                    categoryId: b.category_id,
                    amount: b.amount,
                    spent: b.current_spending,
                    remaining: b.remaining,
                    status: b.percentage >= 100 ? 'exceeded' : (b.percentage >= 80 ? 'at_risk' : 'on_track')
                };
            });

            return {
                totalBudgeted,
                totalSpent,
                overallRemaining: totalBudgeted - totalSpent,
                overallPercentage: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
                details: trackingDetails
            };
        } catch (error) {
            logger.error('Budget tracking error:', error);
            throw error;
        }
    }
};

module.exports = trackingService;
