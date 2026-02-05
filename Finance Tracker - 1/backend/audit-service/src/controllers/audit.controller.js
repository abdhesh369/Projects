const loggingService = require('../services/logging.service');
const complianceService = require('../services/compliance.service');

const auditController = {
    async createLog(req, res) {
        try {
            const {
                userId, action, entityType, entityId,
                previousState, newState
            } = req.body;

            const log = await loggingService.logEvent({
                userId,
                action,
                entityType,
                entityId,
                previousState,
                newState,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.status(201).json(log);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create audit log' });
        }
    },

    async getMyLogs(req, res) {
        try {
            // In a real app, userId would come from auth middleware
            const userId = req.query.userId;
            const { limit, offset } = req.query;
            const logs = await loggingService.getUserLogs(userId, {
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });
            res.status(200).json(logs);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch logs' });
        }
    },

    async purge(req, res) {
        try {
            const { days } = req.body;
            const count = await complianceService.purgeOldLogs(days || 90);
            res.status(200).json({ message: `Purged ${count} logs` });
        } catch (error) {
            res.status(500).json({ error: 'Failed to purge logs' });
        }
    }
};

module.exports = auditController;
