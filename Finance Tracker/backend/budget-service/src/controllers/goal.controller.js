const Goal = require('../models/goal.model');
const logger = require('../../../shared/utils/logger');

const goalController = {
    async create(req, res) {
        try {
            const goalData = {
                userId: req.user.id,
                ...req.body
            };
            const goal = await Goal.create(goalData);
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
            res.status(200).json({ message: 'Goal deleted successfully' });
        } catch (error) {
            logger.error('Delete goal error:', error);
            res.status(500).json({ error: 'Failed to delete goal' });
        }
    }
};

module.exports = goalController;
