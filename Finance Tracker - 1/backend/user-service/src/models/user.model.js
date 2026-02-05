const db = require('../config/db');

const User = {
    async findById(id) {
        const query = 'SELECT id, email, first_name, last_name, preferences, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
};

module.exports = User;
