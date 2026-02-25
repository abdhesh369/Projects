const Transaction = require('../models/transaction.model');

const transactionService = {
    async addTransaction(data) {
        // Here we could add logic for categorization if categoryId is missing
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
    }
};

module.exports = transactionService;
