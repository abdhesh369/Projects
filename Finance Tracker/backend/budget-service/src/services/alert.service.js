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
                if (budget.percentage >= 100) {
                    alerts.push({
                        budgetId: budget.id,
                        categoryId: budget.category_id,
                        type: 'danger',
                        message: `You have exceeded your ${budget.period} budget for this category.`,
                        percentage: budget.percentage
                    });
                } else if (budget.percentage >= 80) {
                    alerts.push({
                        budgetId: budget.id,
                        categoryId: budget.category_id,
                        type: 'warning',
                        message: `You are approaching your ${budget.period} budget limit (${Math.round(budget.percentage)}% used).`,
                        percentage: budget.percentage
                    });
                }
            }

            // In a real system, we might save these to a database and trigger notifications
            // For now, we return them to the caller
            return alerts;
        } catch (error) {
            logger.error('Budget threshold check error:', error);
            throw error;
        }
    }
};

module.exports = alertService;
