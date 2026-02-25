const Transaction = require('../models/transaction.model');
const Category = require('../models/category.model');
const categorizationService = require('./categorization.service');

const transactionService = {
    async addTransaction(data) {
        // Fix Issue #9: Auto-categorize if categoryId is missing
        if (!data.categoryId && data.description) {
            const categoryName = categorizationService.categorize(data.description);
            if (categoryName) {
                const category = await Category.findByName(data.userId, categoryName);
                if (category) {
                    data.categoryId = category.id;
                }
            }
        }
        return await Transaction.create(data);
    },

    async getTransactions(userId, filters) {
        return await Transaction.findByUserId(userId, filters);
    },

    async getTransactionById(id, userId) {
        return await Transaction.findById(id, userId);
    },

    async updateTransaction(id, userId, updates) {
        return await Transaction.update(id, userId, updates);
    },

    async deleteTransaction(id, userId) {
        return await Transaction.delete(id, userId);
    },

    async getSummary(userId, filters) {
        return await Transaction.getSummary(userId, filters);
    },

    async getCategoryBreakdown(userId, filters) {
        return await Transaction.getCategoryBreakdown(userId, filters);
    },

    async getSpendingTrend(userId, filters) {
        return await Transaction.getSpendingTrend(userId, filters);
    },

    async getIncomeVsExpenses(userId, filters) {
        return await Transaction.getIncomeVsExpenses(userId, filters);
    },

    async getNetFlowTrend(userId) {
        return await Transaction.getNetFlowTrend(userId);
    },

    async getCategorySpending(userId, categoryId, filters) {
        return await Transaction.getCategorySpending(userId, categoryId, filters);
    },

    async sync(userId, syncData) {
        return await Transaction.bulkSync(userId, syncData);
    }
};

module.exports = transactionService;
