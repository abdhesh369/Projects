const logger = require('../../../shared/utils/logger');
const budgetService = require('./budget.service');

/**
 * Alert Service
 * Analyzes budgets and generates threshold alerts
 */
const alertService = {
    /**
     * Checks user budgets and triggers alerts if they exceed thresholds (e.g. 80%, 100%)
     * @param {string} userId 
     * @returns {Array} List of alerts triggered
     */
    async checkBudgetThresholds(userId) {
        try {
            const budgets = await budgetService.getUserBudgets(userId);
            const alerts = [];

            for (const budget of budgets) {
                // Threshold alerts
                if (budget.percentage >= 100) {
                    alerts.push({
                        budgetId: budget.id,
                        categoryId: budget.category_id,
                        categoryName: budget.category_name,
                        type: 'danger',
                        message: `You have exceeded your ${budget.period} budget for ${budget.category_name}.`,
                        percentage: budget.percentage
                    });
                } else if (budget.percentage >= 80) {
                    alerts.push({
                        budgetId: budget.id,
                        categoryId: budget.category_id,
                        categoryName: budget.category_name,
                        type: 'warning',
                        message: `You are approaching your ${budget.period} budget limit for ${budget.category_name} (${Math.round(budget.percentage)}% used).`,
                        percentage: budget.percentage
                    });
                }

                // TREND CHECK: Compare with previous period (M-06)
                try {
                    const historicalSpending = await budgetService.getHistoricalSpending(userId, budget);
                    if (historicalSpending > 0) {
                        const trendIncrease = ((budget.current_spending - historicalSpending) / historicalSpending) * 100;
                        if (trendIncrease > 20) { // Alert if spending increased by more than 20%
                            alerts.push({
                                budgetId: budget.id,
                                categoryId: budget.category_id,
                                categoryName: budget.category_name,
                                type: 'info',
                                message: `Trend Alert: Your spending in ${budget.category_name} has increased by ${Math.round(trendIncrease)}% compared to the previous period.`,
                                percentage: budget.percentage,
                                trend: trendIncrease
                            });
                        }
                    }
                } catch (trendError) {
                    logger.warn(`Failed to process trend alert for budget ${budget.id}:`, trendError.message);
                }
            }

            return alerts;
        } catch (error) {
            logger.error('Budget threshold check error:', error);
            throw error;
        }
    }
};

module.exports = alertService;
