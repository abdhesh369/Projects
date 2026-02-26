const Goal = require('../models/goal.model');
const auditLogger = require('../../../shared/utils/audit-logger');
const logger = require('../../../shared/utils/logger');

const goalController = {
    async createGoal(req, res) {
        try {
            const userId = req.user.id;
            const goal = await Goal.create(userId, req.body);
            await auditLogger.log(userId, 'CREATE', 'GOAL', goal.id, req.body, req.ip);
            res.status(201).json(goal);
        } catch (error) {
            logger.error('Create Goal Controller Error:', error);
            res.status(500).json({ error: 'Failed to create goal' });
        }
    },

    async getGoals(req, res) {
        try {
            const userId = req.user.id;
            const goals = await Goal.findByUserId(userId);
            res.json(goals);
        } catch (error) {
            logger.error('Get Goals Controller Error:', error);
            res.status(500).json({ error: 'Failed to fetch goals' });
        }
    },

    async getGoalById(req, res) {
        try {
            const userId = req.user.id;
            const goal = await Goal.findById(req.params.id, userId);
            if (!goal) return res.status(404).json({ error: 'Goal not found' });
            res.json(goal);
        } catch (error) {
            logger.error('Get Goal By ID Controller Error:', error);
            res.status(500).json({ error: 'Failed to fetch goal' });
        }
    },

    async updateGoal(req, res) {
        try {
            const userId = req.user.id;
            const goal = await Goal.update(req.params.id, userId, req.body);
            if (!goal) return res.status(404).json({ error: 'Goal not found' });
            await auditLogger.log(userId, 'UPDATE', 'GOAL', goal.id, req.body, req.ip);
            res.json(goal);
        } catch (error) {
            logger.error('Update Goal Controller Error:', error);
            res.status(500).json({ error: 'Failed to update goal' });
        }
    },

    async deleteGoal(req, res) {
        try {
            const userId = req.user.id;
            const deleted = await Goal.delete(req.params.id, userId);
            if (!deleted) return res.status(404).json({ error: 'Goal not found' });
            await auditLogger.log(userId, 'DELETE', 'GOAL', req.params.id, {}, req.ip);
            res.status(204).send();
        } catch (error) {
            logger.error('Delete Goal Controller Error:', error);
            res.status(500).json({ error: 'Failed to delete goal' });
        }
    },

    async contribute(req, res) {
        try {
            const userId = req.user.id;
            const { amount } = req.body;
            if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid contribution amount' });

            const goal = await Goal.updateProgress(req.params.id, userId, amount);
            if (!goal) return res.status(404).json({ error: 'Goal not found' });
            await auditLogger.log(userId, 'CONTRIBUTE', 'GOAL', req.params.id, { amount }, req.ip);
            res.json(goal);
        } catch (error) {
            logger.error('Goal Contribution Controller Error:', error);
            res.status(500).json({ error: 'Failed to process contribution' });
        }
    }
};

module.exports = goalController;
