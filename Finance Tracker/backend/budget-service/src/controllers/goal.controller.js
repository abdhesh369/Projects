const Goal = require('../models/goal.model');
const logger = require('../../../shared/utils/logger');
const auditLogger = require('../../../shared/utils/audit-logger');

const goalController = {
    async create(req, res) {
        try {
            const goalData = {
                userId: req.user.id,
                ...req.body
            };
            const goal = await Goal.create(goalData);
            await auditLogger.log(req.user.id, 'CREATE', 'GOAL', goal.id, req.body, req.ip);
            res.status(201).json(goal);
        } catch (error) {
            logger.error('Create goal error:', error);
            res.status(500).json({ error: 'Failed to create goal' });
        }
    },

    async list(req, res) {
        try {
            const goals = await Goal.findAllByUserId(req.user.id);
            res.status(200).json(goals);
        } catch (error) {
            logger.error('List goals error:', error);
            res.status(500).json({ error: 'Failed to fetch goals' });
        }
    },

    async get(req, res) {
        try {
            const goal = await Goal.findByIdAndUserId(req.params.id, req.user.id);
            if (!goal) return res.status(404).json({ error: 'Goal not found' });
            res.status(200).json(goal);
        } catch (error) {
            logger.error('Get goal error:', error);
            res.status(500).json({ error: 'Failed to fetch goal' });
        }
    },

    async update(req, res) {
        try {
            const goal = await Goal.update(req.params.id, req.user.id, req.body);
            if (!goal) return res.status(404).json({ error: 'Goal not found' });
            await auditLogger.log(req.user.id, 'UPDATE', 'GOAL', goal.id, req.body, req.ip);
            res.status(200).json(goal);
        } catch (error) {
            logger.error('Update goal error:', error);
            res.status(500).json({ error: 'Failed to update goal' });
        }
    },

    async delete(req, res) {
        try {
            const goal = await Goal.delete(req.params.id, req.user.id);
            if (!goal) return res.status(404).json({ error: 'Goal not found' });
            await auditLogger.log(req.user.id, 'DELETE', 'GOAL', req.params.id, {}, req.ip);
            res.status(200).json({ message: 'Goal deleted successfully' });
        } catch (error) {
            logger.error('Delete goal error:', error);
            res.status(500).json({ error: 'Failed to delete goal' });
        }
    },

    async contribute(req, res) {
        try {
            const { amount } = req.body;
            if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid contribution amount' });

            const goal = await Goal.updateProgress(req.params.id, req.user.id, amount);
            if (!goal) return res.status(404).json({ error: 'Goal not found' });

            await auditLogger.log(req.user.id, 'CONTRIBUTE', 'GOAL', req.params.id, { amount }, req.ip);
            res.status(200).json(goal);
        } catch (error) {
            logger.error('Goal contribution error:', error);
            res.status(500).json({ error: 'Failed to process contribution' });
        }
    }
};

module.exports = goalController;
