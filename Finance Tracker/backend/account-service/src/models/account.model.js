const db = require('../config/db');

const Account = {
    async create({ userId, name, type, balance, currency, institution, color, icon }) {
        const query = `
            INSERT INTO accounts (user_id, name, type, balance, currency, institution, color, icon)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [userId, name, type, balance, currency, institution, color, icon];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findAllByUserId(userId) {
        const query = 'SELECT * FROM accounts WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC';
        const { rows } = await db.query(query, [userId]);
        return rows[0] ? rows : [];
    },

    async findByIdAndUserId(id, userId) {
        const query = 'SELECT * FROM accounts WHERE id = $1 AND user_id = $2';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    },

    async update(id, userId, updates) {
        const fields = Object.keys(updates);
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        const query = `
            UPDATE accounts 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const values = [id, userId, ...Object.values(updates)];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async delete(id, userId) {
        const query = 'UPDATE accounts SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
};

module.exports = Account;
