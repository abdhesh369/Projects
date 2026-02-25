const transactionClient = require('../utils/transactionClient');

/**
 * Trend Detection Service
 * Identifies patterns in spending behavior
 */
const trendDetectionService = {
    /**
     * Identifies top spending categories and changes over time
     * @param {string} userId 
     * @returns {Object} Trend summary
     */
    async detectSpendingTrends(userId) {
        try {
            // Get data for last 2 months to compare
            const now = new Date();
            const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

            const currentMonthBreakdown = await transactionClient.getCategoryBreakdown(userId, startOfCurrentMonth, now.toISOString().split('T')[0]);
            const lastMonthBreakdown = await transactionClient.getCategoryBreakdown(userId, startOfLastMonth, endOfLastMonth);

            const trends = {
                topCategories: currentMonthBreakdown.slice(0, 3),
                significantChanges: []
            };

            // Detect significant shifts
            currentMonthBreakdown.forEach(current => {
                const previous = lastMonthBreakdown.find(p => p.category === current.category);
                if (previous) {
                    const change = (current.amount - previous.amount) / previous.amount;
                    if (Math.abs(change) > 0.25) {
                        trends.significantChanges.push({
                            category: current.category,
                            change: Math.round(change * 100),
                            level: change > 0 ? 'increase' : 'decrease'
                        });
                    }
                } else {
                    // New category spending
                    trends.significantChanges.push({
                        category: current.category,
                        message: 'New spending category detected this month',
                        level: 'new'
                    });
                }
            });

            return trends;
        } catch (error) {
            console.error('Trend detection error:', error);
            throw error;
        }
    }
};

module.exports = trendDetectionService;
