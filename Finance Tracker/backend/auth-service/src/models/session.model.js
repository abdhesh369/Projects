const db = require('../config/db');
const crypto = require('crypto');

const Session = {
    /**
     * Create the sessions table if it doesn't exist.
     */
    async ensureTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS active_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                token_hash VARCHAR(256) NOT NULL,
                device_info VARCHAR(512),
                ip_address VARCHAR(45),
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(token_hash)
            );
        `;
        await db.query(query);
    },

    /**
     * Hash a token for secure storage.
     */
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    },

    /**
     * Create a new session record.
     */
    async create(userId, token, deviceInfo = 'Unknown', ipAddress = '0.0.0.0') {
        const tokenHash = this.hashToken(token);
        const query = `
            INSERT INTO active_sessions (user_id, token_hash, device_info, ip_address)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [userId, tokenHash, deviceInfo, ipAddress]);
        return rows[0];
    },

    /**
     * Find all active sessions for a user.
     */
    async findByUserId(userId) {
        const query = `
            SELECT id, device_info, ip_address, last_active, created_at
            FROM active_sessions
            WHERE user_id = $1
            ORDER BY last_active DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    /**
     * Update last_active timestamp for a session.
     */
    async touch(token) {
        const tokenHash = this.hashToken(token);
        const query = `
            UPDATE active_sessions SET last_active = CURRENT_TIMESTAMP
            WHERE token_hash = $1;
        `;
        await db.query(query, [tokenHash]);
    },

    /**
     * Delete a specific session by token.
     */
    async deleteByToken(token) {
        const tokenHash = this.hashToken(token);
        const query = 'DELETE FROM active_sessions WHERE token_hash = $1';
        await db.query(query, [tokenHash]);
    },

    /**
     * Delete all sessions for a user (logout all devices).
     */
    async deleteAllByUserId(userId) {
        const query = 'DELETE FROM active_sessions WHERE user_id = $1';
        const result = await db.query(query, [userId]);
        return result.rowCount;
    },

    /**
     * Delete all sessions for a user except the current one.
     */
    async deleteOthersByUserId(userId, currentToken) {
        const currentTokenHash = this.hashToken(currentToken);
        const query = 'DELETE FROM active_sessions WHERE user_id = $1 AND token_hash != $2';
        const result = await db.query(query, [userId, currentTokenHash]);
        return result.rowCount;
    }
};

module.exports = Session;
