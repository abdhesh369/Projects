const transactionService = require('../services/transaction.service');
const RecurringTransaction = require('../models/recurring-transaction.model');

const transactionController = {
    async create(req, res) {
        try {
            const userId = req.user.id;
            const transaction = await transactionService.addTransaction({ ...req.body, userId });
            res.status(201).json(transaction);
        } catch (error) {
            console.error('Create transaction error:', error);
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    },

    async list(req, res) {
        try {
            const userId = req.user.id;
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
            console.error('List transactions error:', error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    },

    async get(req, res) {
        try {
            const userId = req.user.id;
            const transaction = await transactionService.getTransactionById(req.params.id, userId);
            if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
            res.status(200).json(transaction);
        } catch (error) {
            console.error('Get transaction error:', error);
            res.status(500).json({ error: 'Failed to fetch transaction' });
        }
    },

    async update(req, res) {
        try {
            const userId = req.user.id;
            const transaction = await transactionService.updateTransaction(req.params.id, userId, req.body);
            if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
            res.status(200).json(transaction);
        } catch (error) {
            console.error('Update transaction error:', error);
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    },

    async delete(req, res) {
        try {
            const userId = req.user.id;
            await transactionService.deleteTransaction(req.params.id, userId);
            res.status(204).send();
        } catch (error) {
            console.error('Delete transaction error:', error);
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    },

    async createRecurring(req, res) {
        try {
            const userId = req.user.id;
            const rt = await RecurringTransaction.create({ ...req.body, userId });
            res.status(201).json(rt);
        } catch (error) {
            console.error('Create recurring error:', error);
            res.status(500).json({ error: 'Failed to create recurring transaction' });
        }
    },

    async listRecurring(req, res) {
        try {
            const userId = req.user.id;
            const rts = await RecurringTransaction.findByUserId(userId);
            res.status(200).json(rts);
        } catch (error) {
            console.error('List recurring error:', error);
            res.status(500).json({ error: 'Failed to fetch recurring transactions' });
        }
    },

    async getSummary(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate } = req.query;
            const summary = await transactionService.getSummary(userId, { startDate, endDate });
            res.status(200).json(summary);
        } catch (error) {
            console.error('Get summary error:', error);
            res.status(500).json({ error: 'Failed to fetch transaction summary' });
        }
    },

    async getCategoryBreakdown(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate } = req.query;
            const breakdown = await transactionService.getCategoryBreakdown(userId, { startDate, endDate });
            res.status(200).json(breakdown);
        } catch (error) {
            console.error('Get breakdown error:', error);
            res.status(500).json({ error: 'Failed to fetch category breakdown' });
        }
    },

    async getSpendingTrend(req, res) {
        try {
            const userId = req.user.id;
            const { limit } = req.query;
            const trend = await transactionService.getSpendingTrend(userId, { limit });
            res.status(200).json(trend);
        } catch (error) {
            console.error('Get spending trend error:', error);
            res.status(500).json({ error: 'Failed to fetch spending trend' });
        }
    },

    async getIncomeVsExpenses(req, res) {
        try {
            const userId = req.user.id;
            const { limit } = req.query;
            const trend = await transactionService.getIncomeVsExpenses(userId, { limit });
            res.status(200).json(trend);
        } catch (error) {
            console.error('Get income vs expenses error:', error);
            res.status(500).json({ error: 'Failed to fetch income vs expenses' });
        }
    },

    async getNetFlowTrend(req, res) {
        try {
            const userId = req.user.id;
            const trend = await transactionService.getNetFlowTrend(userId);
            res.status(200).json(trend);
        } catch (error) {
            console.error('Get net flow trend error:', error);
            res.status(500).json({ error: 'Failed to fetch net flow trend' });
        }
    },

    async getCategorySpending(req, res) {
        try {
            const userId = req.user.id;
            const { categoryId } = req.params;
            const { startDate, endDate } = req.query;
            const spending = await transactionService.getCategorySpending(userId, categoryId, { startDate, endDate });
            res.status(200).json({ current_spending: spending });
        } catch (error) {
            console.error('Get category spending error:', error);
            res.status(500).json({ error: 'Failed to fetch category spending' });
        }
    }
};

module.exports = transactionController;
