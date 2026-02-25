const db = require('../config/db');

const complianceService = {
    async purgeOldLogs(daysRetention) {
        const query = `
            DELETE FROM audit_logs 
            WHERE created_at < NOW() - (INTERVAL '1 day' * $1);
        `;
        const { rowCount } = await db.query(query, [daysRetention]);
        console.log(`[Audit] Compliance: Purged ${rowCount} logs older than ${daysRetention} days.`);
        return rowCount;
    },

    async anonymizeUserLogs(userId) {
        const query = `
            UPDATE audit_logs 
            SET user_id = NULL, ip_address = 'anonymized'
            WHERE user_id = $1;
        `;
        const { rowCount } = await db.query(query, [userId]);
        console.log(`[Audit] Compliance: Anonymized ${rowCount} logs for user ${userId}.`);
        return rowCount;
    }
};

module.exports = complianceService;
