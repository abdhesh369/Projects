const logger = require('../../../shared/utils/logger');
const budgetService = require('../services/budget.service');
const trackingService = require('../services/tracking.service');
const alertService = require('../services/alert.service');

const budgetController = {
    async create(req, res) {
        try {
            const userId = req.user.id;
            const budget = await budgetService.createBudget({ ...req.body, userId });
            res.status(201).json(budget);
        } catch (error) {
            logger.error('Create budget error:', error);
            res.status(500).json({ error: 'Failed to create budget' });
        }
    },

    async list(req, res) {
        try {
            const userId = req.user.id;
            const budgets = await budgetService.getUserBudgets(userId);
            res.status(200).json(budgets);
        } catch (error) {
            logger.error('List budgets error:', error);
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
            logger.error('Update budget error:', error);
            res.status(500).json({ error: 'Failed to update budget' });
        }
    },

    async delete(req, res) {
        try {
            const userId = req.user.id;
            await budgetService.deleteBudget(req.params.id, userId);
            res.status(204).send();
        } catch (error) {
            logger.error('Delete budget error:', error);
            res.status(500).json({ error: 'Failed to delete budget' });
        }
    },

    async getTrackingSummary(req, res) {
        try {
            const userId = req.user.id;
            const summary = await trackingService.getBudgetTrackingSummary(userId);
            res.status(200).json(summary);
        } catch (error) {
            logger.error('Tracking summary error:', error);
            res.status(500).json({ error: 'Failed to fetch budget tracking summary' });
        }
    },

    async getAlerts(req, res) {
        try {
            const userId = req.user.id;
            const alerts = await alertService.checkBudgetThresholds(userId);
            res.status(200).json(alerts);
        } catch (error) {
            logger.error('Budget alerts error:', error);
            res.status(500).json({ error: 'Failed to fetch budget alerts' });
        }
    }
};

module.exports = budgetController;
