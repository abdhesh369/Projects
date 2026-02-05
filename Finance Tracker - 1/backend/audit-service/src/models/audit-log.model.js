const db = require('../config/db');

const AuditLog = {
    async create({ userId, action, entityType, entityId, previousState, newState, ipAddress, userAgent }) {
        const query = `
            INSERT INTO audit_logs (
                user_id, action, entity_type, entity_id, 
                previous_state, new_state, ip_address, user_agent
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            userId, action, entityType, entityId,
            previousState, newState, ipAddress, userAgent
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByUserId(userId, limit = 100, offset = 0) {
        const query = `
            SELECT * FROM audit_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3;
        `;
        const { rows } = await db.query(query, [userId, limit, offset]);
        return rows;
    },

    async findAll(limit = 100, offset = 0) {
        const query = `
            SELECT * FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2;
        `;
        const { rows } = await db.query(query, [limit, offset]);
        return rows;
    }
};

module.exports = AuditLog;
