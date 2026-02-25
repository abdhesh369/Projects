const logger = require('../../../shared/utils/logger');
const transactionClient = require('../utils/transactionClient');

/**
 * Forecasting Service
 * Predicts future spending based on historical data
 */
const forecastingService = {
    /**
     * Predicts next month's spending using a 3-month moving average
     * @param {string} userId 
     * @returns {Object} { forecastedAmount, confidence }
     */
    async predictNextMonthSpending(userId) {
        try {
            // Fetch last 6 months of trend data to have enough context
            const trend = await transactionClient.getSpendingTrend(userId, 6);

            if (!trend || trend.length < 3) {
                return {
                    forecastedAmount: 0,
                    confidence: 'low',
                    message: 'Not enough historical data to generate a forecast'
                };
            }

            // Get last 3 months
            const lastThree = trend.slice(-3);
            const sum = lastThree.reduce((acc, curr) => acc + parseFloat(curr.value), 0);
            const average = sum / 3;

            // Simple trend detection (up, down, stable)
            let confidence = 'medium';
            if (trend.length >= 5) {
                confidence = 'high';
            }

            return {
                forecastedAmount: Math.round(average * 100) / 100,
                confidence,
                basedOnMonths: lastThree.map(m => m.month),
                nextMonth: this._getNextMonth(lastThree[lastThree.length - 1].month)
            };
        } catch (error) {
            logger.error('Forecasting calculation error:', error);
            throw error;
        }
    },

    _getNextMonth(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        let nextMonth = month + 1;
        let nextYear = year;
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
        }
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    }
};

module.exports = forecastingService;
