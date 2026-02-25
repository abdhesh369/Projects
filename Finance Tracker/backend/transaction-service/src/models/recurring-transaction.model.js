const db = require('../config/db');

const RecurringTransaction = {
    async create({ userId, accountId, categoryId, amount, type, description, frequency, startDate, endDate }) {
        const query = `
            INSERT INTO recurring_transactions (
                user_id, account_id, category_id, amount, type, 
                description, frequency, start_date, end_date, next_occurrence
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const values = [
            userId, accountId, categoryId, amount, type,
            description, frequency, startDate, endDate, startDate
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findDue(date = new Date()) {
        const query = `
            SELECT * FROM recurring_transactions 
            WHERE is_active = TRUE AND next_occurrence <= $1
        `;
        const { rows } = await db.query(query, [date]);
        return rows;
    },

    async updateNextOccurrence(id, nextOccurrence) {
        const query = 'UPDATE recurring_transactions SET next_occurrence = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
        const { rows } = await db.query(query, [nextOccurrence, id]);
        return rows[0];
    },

    async deactivate(id) {
        const query = `
            UPDATE recurring_transactions 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 RETURNING *
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    async findByUserId(userId) {
        const query = 'SELECT * FROM recurring_transactions WHERE user_id = $1';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
};

module.exports = RecurringTransaction;
