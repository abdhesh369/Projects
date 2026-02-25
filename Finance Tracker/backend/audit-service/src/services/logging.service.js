const logger = require('../../../shared/utils/logger');
const AuditLog = require('../models/audit-log.model');

const loggingService = {
    async logEvent(eventData) {
        try {
            const log = await AuditLog.create(eventData);
            logger.info(`[Audit] Event logged: ${log.action} for entity ${log.entity_type}:${log.entity_id}`);
            return log;
        } catch (error) {
            logger.error('[Audit] Failed to log event:', error);
            throw error;
        }
    },

    async getUserLogs(userId, { limit, offset } = {}) {
        return await AuditLog.findByUserId(userId, limit, offset);
    },

    async getAllLogs({ limit, offset } = {}) {
        return await AuditLog.findAll(limit, offset);
    }
};

module.exports = loggingService;
