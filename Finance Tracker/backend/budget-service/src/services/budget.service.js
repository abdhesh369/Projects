const Budget = require('../models/budget.model');
const axios = require('axios');

const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3009';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

const budgetService = {
    async createBudget(data) {
        return await Budget.create(data);
    },

    async getUserBudgets(userId) {
        const budgets = await Budget.findByUserId(userId);

        if (!budgets || budgets.length === 0) return [];

        // Enhance with current spending status
        const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
            const now = new Date();
            let startDate, endDate;

            switch (budget.period) {
                case 'weekly':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - now.getDay());
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);
                    break;
                case 'yearly':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    endDate = new Date(now.getFullYear(), 11, 31);
                    break;
                case 'monthly':
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    break;
            }

            let currentSpending = 0;
            try {
                // Fetch spending securely from transaction-service via internal API
                const response = await axios.get(
                    `${TRANSACTION_SERVICE_URL}/api/transactions/categories/${budget.category_id}/spending`,
                    {
                        params: {
                            startDate: startDate.toISOString().split('T')[0],
                            endDate: endDate.toISOString().split('T')[0]
                        },
                        headers: {
                            'X-Internal-Token': INTERNAL_SERVICE_TOKEN,
                            'X-User-Id': userId
                        }
                    }
                );
                currentSpending = response.data?.current_spending || 0;
            } catch (error) {
                console.error(`[Budget Service] Failed to fetch spending for category ${budget.category_id}:`, error.message);
                // Fallback to 0 if transaction service is unavailable
            }

            return {
                ...budget,
                current_spending: parseFloat(currentSpending),
                remaining: parseFloat(budget.amount) - parseFloat(currentSpending),
                percentage: (parseFloat(currentSpending) / parseFloat(budget.amount)) * 100
            };
        }));

        return enrichedBudgets;
    },

    async updateBudget(id, userId, updates) {
        return await Budget.update(id, userId, updates);
    },

    async deleteBudget(id, userId) {
        return await Budget.delete(id, userId);
    }
};

module.exports = budgetService;
