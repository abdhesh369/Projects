const db = require('../config/db');

const Transaction = {
    async create({ userId, accountId, categoryId, amount, type, description, date, notes, isRecurring }) {
        const query = `
            INSERT INTO transactions (
                user_id, account_id, category_id, amount, type, 
                description, date, notes, is_recurring
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            userId, accountId, categoryId, amount, type,
            description, date || new Date(), notes, isRecurring || false
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByUserId(userId, { limit = 50, offset = 0, startDate, endDate, categoryId, type } = {}) {
        let query = `
            SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
        `;
        const values = [userId];
        let paramCount = 1;

        if (startDate) {
            paramCount++;
            query += ` AND t.date >= $${paramCount}`;
            values.push(startDate);
        }
        if (endDate) {
            paramCount++;
            query += ` AND t.date <= $${paramCount}`;
            values.push(endDate);
        }
        if (categoryId) {
            paramCount++;
            query += ` AND t.category_id = $${paramCount}`;
            values.push(categoryId);
        }
        if (type) {
            paramCount++;
            query += ` AND t.type = $${paramCount}`;
            values.push(type);
        }

        query += ` ORDER BY t.date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(limit, offset);

        const { rows } = await db.query(query, values);
        return rows;
    },

    async findById(id, userId) {
        const query = 'SELECT * FROM transactions WHERE id = $1 AND user_id = $2';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    },

    async update(id, userId, updates) {
        const fields = Object.keys(updates);
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        const query = `
            UPDATE transactions 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const values = [id, userId, ...Object.values(updates)];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async delete(id, userId) {
        const query = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
};

module.exports = Transaction;
