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
    }
};

module.exports = transactionService;
