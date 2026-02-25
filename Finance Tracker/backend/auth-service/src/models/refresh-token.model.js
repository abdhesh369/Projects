const db = require('../config/db');

const RefreshToken = {
    async create(userId, token, expiresAt) {
        const query = `
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [userId, token, expiresAt];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByToken(token) {
        const query = 'SELECT * FROM refresh_tokens WHERE token = $1';
        const { rows } = await db.query(query, [token]);
        return rows[0];
    },

    async deleteByUserId(userId) {
        const query = 'DELETE FROM refresh_tokens WHERE user_id = $1';
        await db.query(query, [userId]);
    },

    async deleteByToken(token) {
        const query = 'DELETE FROM refresh_tokens WHERE token = $1';
        await db.query(query, [token]);
    }
};

module.exports = RefreshToken;
