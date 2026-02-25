const axios = require('axios');

// Using localhost as we are in a single-machine dev environment.
// In production, these would be service names or internal DNS.
const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3009';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

const reportGenerationService = {
    async generateSummary(userId, { startDate, endDate }) {
        try {
            const response = await axios.get(`${TRANSACTION_SERVICE_URL}/summary`, {
                params: { startDate, endDate },
                headers: {
                    'X-Internal-Token': INTERNAL_SERVICE_TOKEN,
                    'X-User-Id': userId // Pass-through auth context
                }
            });
            return response.data;
        } catch (error) {
            console.error('[Reporting] Summary fetch error:', error.message);
            throw new Error('Failed to fetch reporting summary data');
        }
    },

    async getCategoryBreakdown(userId, { startDate, endDate }) {
        try {
            const response = await axios.get(`${TRANSACTION_SERVICE_URL}/categories/breakdown`, {
                params: { startDate, endDate },
                headers: {
                    'X-Internal-Token': INTERNAL_SERVICE_TOKEN,
                    'X-User-Id': userId
                }
            });
            return response.data;
        } catch (error) {
            console.error('[Reporting] Breakdown fetch error:', error.message);
            throw new Error('Failed to fetch category breakdown data');
        }
    },

    async getTransactions(userId, { startDate, endDate }) {
        try {
            const response = await axios.get(`${TRANSACTION_SERVICE_URL}`, {
                params: { startDate, endDate, limit: 10000 },
                headers: {
                    'X-Internal-Token': INTERNAL_SERVICE_TOKEN,
                    'X-User-Id': userId
                }
            });
            return response.data.transactions || response.data;
        } catch (error) {
            console.error('[Reporting] Transactions fetch error:', error.message);
            throw new Error('Failed to fetch transactions for export');
        }
    }
};

module.exports = reportGenerationService;
