const pool = require('../config/db');
const logger = require('./logger');

/**
 * Audit Logger utility for tracking sensitive operations.
 * Supports both object-based (auth-service style) and positional (new style) arguments.
 */
const auditLogger = {
    async log(arg1, action, resource, resourceId, details = {}, ipAddress = null) {
        let logEntry;

        if (typeof arg1 === 'object' && !Array.isArray(arg1)) {
            // Object-based style (auth-service)
            logEntry = {
                userId: arg1.userId,
                action: arg1.action,
                resource: arg1.entityType || arg1.resource,
                resourceId: arg1.entityId || arg1.resourceId,
                details: arg1.details || { userAgent: arg1.userAgent },
                ipAddress: arg1.ipAddress
            };
        } else {
            // Positional style
            logEntry = {
                userId: arg1,
                action,
                resource,
                resourceId,
                details,
                ipAddress
            };
        }

        const query = `
            INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [
            logEntry.userId,
            logEntry.action,
            logEntry.resource,
            logEntry.resourceId,
            JSON.stringify(logEntry.details),
            logEntry.ipAddress
        ];

        try {
            if (pool) {
                await pool.query(query, values);
            }
            logger.info(`AUDIT: [User ${logEntry.userId}] ${logEntry.action} ${logEntry.resource} ${logEntry.resourceId}`, logEntry.details);
        } catch (error) {
            logger.error('Audit Logging Error:', error);
        }
    }
};

module.exports = auditLogger;
