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

            if (!trend || trend.length < 2) {
                return [{
                    type: 'info',
                    message: 'Once you have more transactions, we will show you personalized insights here!'
                }];
            }

            const currentMonth = trend[trend.length - 1];
            const previousMonth = trend[trend.length - 2];

            const currentValue = parseFloat(currentMonth.value);
            const previousValue = parseFloat(previousMonth.value);

            // 1. Month-over-Month Spike Detection
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

            // 2. High Category Concentration (Placeholder - would need category breakdown)
            // This would require a new client method getCategoryBreakdown

            return insights;
        } catch (error) {
            console.error('Insights generation error:', error);
            throw error;
        }
    }
};

module.exports = insightsService;
