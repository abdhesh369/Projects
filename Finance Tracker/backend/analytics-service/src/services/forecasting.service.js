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
            // Fetch last 6 months of trend data
            const trend = await transactionClient.getSpendingTrend(userId, 6);

            if (!trend || trend.length === 0) {
                return {
                    forecastedAmount: 0,
                    confidence: 'low',
                    message: 'No transaction history found to generate a forecast.'
                };
            }

            // Filter out months with zero spending if we have enough data
            const validMonths = trend.filter(m => parseFloat(m.value) > 0);

            if (validMonths.length < 2) {
                return {
                    forecastedAmount: validMonths.length === 1 ? parseFloat(validMonths[0].value) : 0,
                    confidence: 'low',
                    message: 'Limited transaction history. Forecast might be inaccurate.'
                };
            }

            // Get last 3 valid months for the moving average
            const lastThree = validMonths.slice(-3);
            const sum = lastThree.reduce((acc, curr) => acc + parseFloat(curr.value), 0);
            const average = sum / lastThree.length;

            // Confidence based on amount of data points
            const confidence = validMonths.length >= 4 ? 'high' : 'medium';

            return {
                forecastedAmount: Math.round(average * 100) / 100,
                confidence,
                basedOnMonths: lastThree.map(m => m.month),
                nextMonth: this._getNextMonth(trend[trend.length - 1].month)
            };
        } catch (error) {
            logger.error('Forecasting calculation error:', error);
            throw error;
        }
    },

    _getNextMonth(yearMonth) {
        if (!yearMonth) {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
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
