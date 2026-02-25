const db = require('../config/db');

const User = {
    async findById(id) {
        const query = 'SELECT id, email, first_name, last_name, preferences, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    async updateProfile(id, updates) {
        const fields = Object.keys(updates);
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const query = `
            UPDATE users 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $${fields.length + 1} 
            RETURNING id, email, first_name, last_name, avatar, preferences, created_at;
        `;
        const values = [...fields.map(f => updates[f]), id];
        const { rows } = await db.query(query, values);
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
    },

    async updateSubscription(stripeCustomerId, { subscriptionId, plan, status }) {
        const query = `
            UPDATE users 
            SET subscription_id = $1, subscription_plan = $2, subscription_status = $3, updated_at = CURRENT_TIMESTAMP 
            WHERE stripe_customer_id = $4 
            RETURNING id, email, stripe_customer_id, subscription_plan, subscription_status;
        `;
        const { rows } = await db.query(query, [subscriptionId, plan, status, stripeCustomerId]);
        return rows[0];
    },

    async findByStripeCustomerId(stripeCustomerId) {
        const query = 'SELECT id, email, stripe_customer_id FROM users WHERE stripe_customer_id = $1';
        const { rows } = await db.query(query, [stripeCustomerId]);
        return rows[0];
    }
};

module.exports = User;
