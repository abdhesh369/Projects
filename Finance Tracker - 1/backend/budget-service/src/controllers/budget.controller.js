const budgetService = require('../services/budget.service');

const budgetController = {
    async create(req, res) {
        try {
            const userId = req.user.id;
            const budget = await budgetService.createBudget({ ...req.body, userId });
            res.status(201).json(budget);
        } catch (error) {
            console.error('Create budget error:', error);
            res.status(500).json({ error: 'Failed to create budget' });
        }
    },

    async list(req, res) {
        try {
            const userId = req.user.id;
            const budgets = await budgetService.getUserBudgets(userId);
            res.status(200).json(budgets);
        } catch (error) {
            console.error('List budgets error:', error);
            res.status(500).json({ error: 'Failed to fetch budgets' });
        }
    },

    async update(req, res) {
        try {
            const userId = req.user.id;
            const budget = await budgetService.updateBudget(req.params.id, userId, req.body);
            if (!budget) return res.status(404).json({ error: 'Budget not found' });
            res.status(200).json(budget);
        } catch (error) {
            console.error('Update budget error:', error);
            res.status(500).json({ error: 'Failed to update budget' });
        }
    },

    async delete(req, res) {
        try {
            const userId = req.user.id;
            await budgetService.deleteBudget(req.params.id, userId);
            res.status(204).send();
        } catch (error) {
            console.error('Delete budget error:', error);
            res.status(500).json({ error: 'Failed to delete budget' });
        }
    }
};

module.exports = budgetController;
