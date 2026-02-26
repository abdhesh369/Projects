const logger = require('../../../shared/utils/logger');
const transactionClient = require('../utils/transactionClient');

const spendingAnalysisService = {
    async getAverageSpending(userId, months = 3) {
        try {
            const trend = await transactionClient.getSpendingTrend(userId, months);
            if (!trend || trend.length === 0) return { average: 0, months: 0 };

            const total = trend.reduce((sum, m) => sum + parseFloat(m.value), 0);
            return {
                average: Math.round((total / trend.length) * 100) / 100,
                months: trend.length
            };
        } catch (error) {
            logger.error(`Error calculating average spending for user ${userId}:`, error);
            throw error;
        }
    },

    async getPeriodComparison(userId) {
        try {
            const trend = await transactionClient.getSpendingTrend(userId, 2);
            if (!trend || trend.length < 2) return null;

            const [prev, curr] = trend.slice(-2).map(m => parseFloat(m.value));
            const delta = curr - prev;
            const pct = prev > 0 ? Math.round((delta / prev) * 100) : 0;

            return { current: curr, previous: prev, delta, percentageChange: pct };
        } catch (error) {
            logger.error(`Error comparing periods for user ${userId}:`, error);
            throw error;
        }
    },

    async getTopCategory(userId, startDate, endDate) {
        try {
            const breakdown = await transactionClient.getCategoryBreakdown(userId, startDate, endDate);
            if (!breakdown || breakdown.length === 0) return null;

            return breakdown.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];
        } catch (error) {
            logger.error(`Error getting top category for user ${userId}:`, error);
            throw error;
        }
    },

    async getConcentrationAnalysis(userId, startDate, endDate) {
        try {
            const breakdown = await transactionClient.getCategoryBreakdown(userId, startDate, endDate);
            if (!breakdown || breakdown.length === 0) return [];

            const total = breakdown.reduce((s, c) => s + parseFloat(c.amount), 0);
            // Flag any category consuming more than 40% of total spend
            return breakdown
                .map(c => ({
                    ...c,
                    percentage: Math.round((parseFloat(c.amount) / total) * 100)
                }))
                .filter(c => c.percentage >= 40);
        } catch (error) {
            logger.error(`Error calculating concentration for user ${userId}:`, error);
            throw error;
        }
    }
};

module.exports = spendingAnalysisService;
