const db = require('../config/db');

const User = {
    async create({ email, passwordHash, firstName, lastName }) {
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, first_name, last_name, role, preferences, created_at;
        `;
        const values = [email, passwordHash, firstName, lastName];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByEmail(email) {
        const query = 'SELECT id, email, password_hash, first_name, last_name, role, mfa_enabled, mfa_secret, preferences, created_at FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    },

    async findById(id) {
        const query = 'SELECT id, email, first_name, last_name, role, preferences, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    async update(id, updates, allowedFields = null) {
        let fields = Object.keys(updates);

        // If an allowlist is provided, filter the updates
        if (allowedFields) {
            fields = fields.filter(field => allowedFields.includes(field));
        }

        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const query = `
            UPDATE users 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, email, first_name, last_name, role, mfa_enabled, preferences, created_at;
        `;
        const values = [id, ...fields.map(f => updates[f])];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
};

module.exports = User;
