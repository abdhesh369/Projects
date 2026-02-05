const db = require('../config/db');

const User = {
    async findById(id) {
        const query = 'SELECT id, email, first_name, last_name, preferences, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    async updateProfile(id, { firstName, lastName }) {
        const query = `
            UPDATE users 
            SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3 
            RETURNING id, email, first_name, last_name, preferences, created_at;
        `;
        const { rows } = await db.query(query, [firstName, lastName, id]);
        return rows[0];
    },

    async updatePreferences(id, preferences) {
        const query = `
            UPDATE users 
            SET preferences = preferences || $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING id, email, first_name, last_name, preferences, created_at;
        `;
        const { rows } = await db.query(query, [JSON.stringify(preferences), id]);
        return rows[0];
    }
};

module.exports = User;
