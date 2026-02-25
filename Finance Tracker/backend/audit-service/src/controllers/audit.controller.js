const loggingService = require('../services/logging.service');
const complianceService = require('../services/compliance.service');

const auditController = {
    async createLog(req, res) {
        try {
            const {
                action, entityType, entityId,
                previousState, newState
            } = req.body;

            // SECURITY: Enforce userId from authenticated user only (Issue #09)
            const userId = req.user.id;

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
            console.error('[Audit] Create log error:', error);
            res.status(500).json({ error: 'Failed to create audit log' });
        }
    },

    async getMyLogs(req, res) {
        try {
            const userId = req.user.id;
            const { limit, offset } = req.query;
            const logs = await loggingService.getUserLogs(userId, {
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });
            res.status(200).json(logs);
        } catch (error) {
            console.error('[Audit] Fetch logs error:', error);
            res.status(500).json({ error: 'Failed to fetch logs' });
        }
    },

    async purge(req, res) {
        try {
            // Role check: Only admin can purge
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: Admin access required' });
            }

            const { days } = req.body;
            const count = await complianceService.purgeOldLogs(days || 90);
            res.status(200).json({ message: `Purged ${count} logs` });
        } catch (error) {
            console.error('[Audit] Purge logs error:', error);
            res.status(500).json({ error: 'Failed to purge logs' });
        }
    }
};

module.exports = auditController;
