const pool = require('../config/db');
const logger = require('../../../shared/utils/logger');

const Goal = {
    async create(userId, goalData) {
        const { name, target_amount, current_amount, currency, target_date, category, description } = goalData;
        const query = `
            INSERT INTO goals (user_id, name, target_amount, current_amount, currency, target_date, category, description, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [userId, name, target_amount, current_amount || 0, currency || 'USD', target_date, category, description, 'active'];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            logger.error('Error creating goal:', error);
            throw error;
        }
    },

    async findByUserId(userId) {
        const query = 'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC';
        try {
            const { rows } = await pool.query(query, [userId]);
            return rows;
        } catch (error) {
            logger.error('Error fetching goals:', error);
            throw error;
        }
    },

    async findById(id, userId) {
        const query = 'SELECT * FROM goals WHERE id = $1 AND user_id = $2';
        try {
            const { rows } = await pool.query(query, [id, userId]);
            return rows[0];
        } catch (error) {
            logger.error('Error fetching goal by id:', error);
            throw error;
        }
    },

    async update(id, userId, updateData) {
        const fields = [];
        const values = [];
        let idx = 1;

        Object.entries(updateData).forEach(([key, value]) => {
            if (['name', 'target_amount', 'current_amount', 'currency', 'target_date', 'category', 'description', 'status'].includes(key)) {
                fields.push(`${key} = $${idx}`);
                values.push(value);
                idx++;
            }
        });

        if (fields.length === 0) return null;

        values.push(id, userId);
        const query = `
            UPDATE goals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${idx} AND user_id = $${idx + 1}
            RETURNING *
        `;

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            logger.error('Error updating goal:', error);
            throw error;
        }
    },

    async delete(id, userId) {
        const query = 'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id';
        try {
            const { rows } = await pool.query(query, [id, userId]);
            return rows[0];
        } catch (error) {
            logger.error('Error deleting goal:', error);
            throw error;
        }
    },

    async updateProgress(id, userId, amount) {
        const query = `
            UPDATE goals 
            SET current_amount = current_amount + $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `;
        try {
            const { rows } = await pool.query(query, [amount, id, userId]);
            return rows[0];
        } catch (error) {
            logger.error('Error updating goal progress:', error);
            throw error;
        }
    }
};

module.exports = Goal;
