const logger = require('../../../shared/utils/logger');
const transactionClient = require('../utils/transactionClient');

/**
 * Insights Service
 * Generates actionable insights and detects anomalies
 */
const insightsService = {
    /**
     * Generates spending insights for a user
     * @param {string} userId 
     * @returns {Array} List of insight objects
     */
    async generateInsights(userId) {
        try {
            const trend = await transactionClient.getSpendingTrend(userId, 3);
            const insights = [];

            if (!trend || trend.length < 1) {
                return [{
                    type: 'info',
                    message: 'Once you have more transactions, we will show you personalized insights here!'
                }];
            }

            const currentMonth = trend[trend.length - 1];
            const currentValue = parseFloat(currentMonth.value);

            // 1. Month-over-Month Spike Detection
            if (trend.length >= 2) {
                const previousMonth = trend[trend.length - 2];
                const previousValue = parseFloat(previousMonth.value);

                if (previousValue > 0) {
                    const growth = (currentValue - previousValue) / previousValue;
                    if (growth > 0.20) {
                        insights.push({
                            type: 'warning',
                            category: 'spending',
                            message: `Your spending increased by ${Math.round(growth * 100)}% compared to last month.`,
                            suggestion: 'Review your recent transactions to identify unnecessary expenses.'
                        });
                    } else if (growth < -0.10) {
                        insights.push({
                            type: 'success',
                            category: 'savings',
                            message: `Great job! You spent ${Math.round(Math.abs(growth) * 100)}% less than last month.`,
                            suggestion: 'Consider moving the surplus to your savings account.'
                        });
                    }
                }
            }

            // 2. High Category Concentration
            // Fetch category breakdown for the current month
            const now = new Date();
            const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const breakdown = await transactionClient.getCategoryBreakdown(userId, startOfCurrentMonth, now.toISOString().split('T')[0]);

            if (breakdown && breakdown.length > 0 && currentValue > 500) {
                const totalSpending = breakdown.reduce((acc, cat) => acc + parseFloat(cat.amount), 0);
                const highestCategory = breakdown.sort((a, b) => b.amount - a.amount)[0];

                if (totalSpending > 0) {
                    const ratio = highestCategory.amount / totalSpending;
                    if (ratio > 0.45) { // If one category is > 45% of spending
                        insights.push({
                            type: 'info',
                            category: 'concentration',
                            message: `A large portion of your spending (${Math.round(ratio * 100)}%) is going to ${highestCategory.categoryName}.`,
                            suggestion: `Try to find ways to reduce your expenses in ${highestCategory.categoryName}.`
                        });
                    }
                }
            }

            return insights.length > 0 ? insights : [{
                type: 'info',
                message: 'Your spending looks balanced this month. Keep it up!'
            }];
        } catch (error) {
            logger.error('Insights generation error:', error);
            throw error;
        }
    }
};

module.exports = insightsService;
