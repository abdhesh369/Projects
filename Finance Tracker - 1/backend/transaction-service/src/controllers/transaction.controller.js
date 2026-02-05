const transactionService = require('../services/transaction.service');

const transactionController = {
    async create(req, res) {
        try {
            const userId = req.headers['x-user-id'] || req.body.userId; // Usually from auth mid
            const transaction = await transactionService.addTransaction({ ...req.body, userId });
            res.status(201).json(transaction);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    },

    async list(req, res) {
        try {
            const userId = req.headers['x-user-id'] || req.query.userId;
            const filters = {
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                categoryId: req.query.categoryId,
                type: req.query.type
            };
            const transactions = await transactionService.getTransactions(userId, filters);
            res.status(200).json(transactions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    },

    async get(req, res) {
        try {
            const userId = req.headers['x-user-id'] || req.query.userId;
            const transaction = await transactionService.getTransactionById(req.params.id, userId);
            if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
            res.status(200).json(transaction);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch transaction' });
        }
    },

    async update(req, res) {
        try {
            const userId = req.headers['x-user-id'] || req.body.userId;
            const transaction = await transactionService.updateTransaction(req.params.id, userId, req.body);
            if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
            res.status(200).json(transaction);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    },

    async delete(req, res) {
        try {
            const userId = req.headers['x-user-id'] || req.query.userId;
            await transactionService.deleteTransaction(req.params.id, userId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    }
};

module.exports = transactionController;
