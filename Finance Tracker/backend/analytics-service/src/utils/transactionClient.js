const logger = require('../../../shared/utils/logger');
const axios = require('axios');

const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3009';
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

const transactionClient = axios.create({
    baseURL: TRANSACTION_SERVICE_URL,
    headers: {
        'x-internal-token': INTERNAL_TOKEN
    }
});

module.exports = {
    /**
     * Fetch recent transactions for a user
     */
    async getTransactions(userId, limit = 100) {
        try {
            const response = await transactionClient.get('/', {
                params: { limit },
                headers: { 'x-user-id': userId }
            });
            return response.data.data;
        } catch (error) {
            logger.error('Error fetching transactions from analytics-service:', error.message);
            throw new Error('Failed to fetch transaction data');
        }
    },

    /**
     * Fetch spending trend for a user
     */
    async getSpendingTrend(userId, limit = 6) {
        try {
            const response = await transactionClient.get('/trends/spending', {
                params: { limit },
                headers: { 'x-user-id': userId }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching spending trend from analytics-service:', error.message);
            throw new Error('Failed to fetch spending trend data');
        }
    },

    /**
     * Fetch category breakdown for a user
     */
    async getCategoryBreakdown(userId, startDate, endDate) {
        try {
            const response = await transactionClient.get('/categories/breakdown', {
                params: { startDate, endDate },
                headers: { 'x-user-id': userId }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching category breakdown from analytics-service:', error.message);
            throw new Error('Failed to fetch category breakdown data');
        }
    }
};
