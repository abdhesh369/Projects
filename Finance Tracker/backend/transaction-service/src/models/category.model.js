const db = require('../config/db');

const Category = {
    async create({ userId, name, type, icon, color, isCustom = true }) {
        const query = `
            INSERT INTO categories (user_id, name, type, icon, color, is_custom)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [userId, name, type, icon, color, isCustom];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByUserId(userId) {
        const query = `
            SELECT * FROM categories 
            WHERE user_id = $1 OR user_id IS NULL 
            ORDER BY is_custom ASC, name ASC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    async findByName(userId, name) {
        const query = `
            SELECT * FROM categories 
            WHERE (user_id = $1 OR user_id IS NULL) AND LOWER(name) = LOWER($2)
            LIMIT 1;
        `;
        const { rows } = await db.query(query, [userId, name]);
        return rows[0];
    },

    async findById(id) {
        const query = 'SELECT * FROM categories WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    async update(id, userId, updates) {
        const ALLOWED_FIELDS = ['name', 'type', 'icon', 'color'];
        const fields = Object.keys(updates).filter(key => ALLOWED_FIELDS.includes(key));
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        const query = `
            UPDATE categories 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const values = [id, userId, ...fields.map(f => updates[f])];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async delete(id, userId) {
        const query = 'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
};

module.exports = Category;
