const AuditLog = require('../models/audit-log.model');

const loggingService = {
    async logEvent(eventData) {
        try {
            const log = await AuditLog.create(eventData);
            console.log(`[Audit] Event logged: ${log.action} for entity ${log.entity_type}:${log.entity_id}`);
            return log;
        } catch (error) {
            console.error('[Audit] Failed to log event:', error);
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
