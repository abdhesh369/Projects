const Budget = require('../models/budget.model');

const budgetService = {
    async createBudget(data) {
        return await Budget.create(data);
    },

    async getUserBudgets(userId) {
        const budgets = await Budget.findByUserId(userId);

        // Enhance with current spending status
        const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
            // Assume monthly for now, calculate current month range
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const currentSpending = await Budget.getBudgetStatus(
                userId,
                budget.category_id,
                startOfMonth,
                endOfMonth
            );

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
