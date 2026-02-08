const db = require('../config/db');

const User = {
    async create({ email, passwordHash, firstName, lastName }) {
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, first_name, last_name, preferences, created_at;
        `;
        const values = [email, passwordHash, firstName, lastName];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    },

    async findById(id) {
        const query = 'SELECT id, email, first_name, last_name, preferences, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
};

module.exports = User;
