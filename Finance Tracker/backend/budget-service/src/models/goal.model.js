const db = require('../config/db');

const Goal = {
    async create({ userId, name, description, targetAmount, currentAmount, deadline, color, icon }) {
        const query = `
            INSERT INTO goals (user_id, name, description, target_amount, current_amount, deadline, color, icon)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [userId, name, description, targetAmount, currentAmount || 0, deadline, color, icon];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findAllByUserId(userId) {
        const query = 'SELECT * FROM goals WHERE user_id = $1 AND is_active = TRUE ORDER BY deadline ASC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    async findByIdAndUserId(id, userId) {
        const query = 'SELECT * FROM goals WHERE id = $1 AND user_id = $2';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    },

    async update(id, userId, updates) {
        const ALLOWED_FIELDS = ['name', 'description', 'target_amount', 'current_amount', 'deadline', 'color', 'icon', 'status'];
        const fields = Object.keys(updates).filter(key => ALLOWED_FIELDS.includes(key));
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        const query = `
            UPDATE goals 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const values = [id, userId, ...fields.map(f => updates[f])];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async delete(id, userId) {
        const query = 'UPDATE goals SET status = \'cancelled\', is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    },

    async updateProgress(id, userId, amount) {
        const query = `
            UPDATE goals 
            SET current_amount = current_amount + $1, 
                status = CASE 
                    WHEN current_amount + $1 >= target_amount THEN 'completed' 
                    ELSE status 
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *;
        `;
        const { rows } = await db.query(query, [amount, id, userId]);
        return rows[0];
    }
};

module.exports = Goal;
