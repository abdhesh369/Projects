const db = require('../config/db');

const Budget = {
    async create({ userId, categoryId, amount, period, startDate }) {
        const query = `
            INSERT INTO budgets (user_id, category_id, amount, period, start_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [userId, categoryId, amount, period || 'monthly', startDate || new Date()];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByUserId(userId) {
        const query = `
            SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
            FROM budgets b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    async findById(id, userId) {
        const query = 'SELECT * FROM budgets WHERE id = $1 AND user_id = $2';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    },

    async update(id, userId, updates) {
        const ALLOWED_FIELDS = ['category_id', 'amount', 'period', 'start_date'];
        const fields = Object.keys(updates).filter(key => ALLOWED_FIELDS.includes(key));
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        const query = `
            UPDATE budgets 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const values = [id, userId, ...fields.map(f => updates[f])];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async delete(id, userId) {
        const query = 'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
};

module.exports = Budget;
