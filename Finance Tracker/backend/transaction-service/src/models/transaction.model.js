const db = require('../config/db');

const Transaction = {
    async create({ userId, accountId, categoryId, amount, type, description, date, notes, isRecurring }) {
        const query = `
            INSERT INTO transactions (
                user_id, account_id, category_id, amount, type, 
                description, date, notes, is_recurring
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            userId, accountId, categoryId, amount, type,
            description, date || new Date(), notes, isRecurring || false
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async findByUserId(userId, { limit = 50, offset = 0, startDate, endDate, categoryId, type } = {}) {
        let query = `
            SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
        `;
        const values = [userId];
        let paramCount = 1;

        if (startDate) {
            paramCount++;
            query += ` AND t.date >= $${paramCount}`;
            values.push(startDate);
        }
        if (endDate) {
            paramCount++;
            query += ` AND t.date <= $${paramCount}`;
            values.push(endDate);
        }
        if (categoryId) {
            paramCount++;
            query += ` AND t.category_id = $${paramCount}`;
            values.push(categoryId);
        }
        if (type) {
            paramCount++;
            query += ` AND t.type = $${paramCount}`;
            values.push(type);
        }

        query += ` ORDER BY t.date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(limit, offset);

        const { rows } = await db.query(query, values);
        return rows;
    },

    async findById(id, userId) {
        const query = 'SELECT * FROM transactions WHERE id = $1 AND user_id = $2';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    },

    async update(id, userId, updates) {
        const ALLOWED_FIELDS = ['account_id', 'category_id', 'amount', 'type', 'description', 'date', 'notes', 'is_recurring'];
        // Map JS camelCase to DB snake_case if necessary, but here the input keys usually match the model keys which match DB columns
        const fields = Object.keys(updates).filter(key => ALLOWED_FIELDS.includes(key));
        if (fields.length === 0) return null;

        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        const query = `
            UPDATE transactions 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const values = [id, userId, ...fields.map(f => updates[f])];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async delete(id, userId) {
        const query = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    },

    async getSummary(userId, { startDate, endDate }) {
        const query = `
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as net_balance
            FROM transactions
            WHERE user_id = $1 AND date >= $2 AND date <= $3
        `;
        const { rows } = await db.query(query, [userId, startDate, endDate]);
        return rows[0];
    },

    async getCategoryBreakdown(userId, { startDate, endDate }) {
        const query = `
            SELECT 
                c.name as category,
                c.icon,
                c.color,
                COALESCE(SUM(t.amount), 0) as amount
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id 
                AND t.user_id = $1 
                AND t.date >= $2 
                AND t.date <= $3
            WHERE c.type = 'expense'
            GROUP BY c.id, c.name, c.icon, c.color
            HAVING SUM(t.amount) > 0
            ORDER BY amount DESC
        `;
        const { rows } = await db.query(query, [userId, startDate, endDate]);
        return rows;
    },

    async getSpendingTrend(userId, { limit = 12 } = {}) {
        const query = `
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                SUM(amount) as value
            FROM transactions
            WHERE user_id = $1 AND type = 'expense'
            GROUP BY month
            ORDER BY month ASC
            LIMIT $2
        `;
        const { rows } = await db.query(query, [userId, limit]);
        return rows;
    },

    async getIncomeVsExpenses(userId, { limit = 12 } = {}) {
        const query = `
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
            FROM transactions
            WHERE user_id = $1
            GROUP BY month
            ORDER BY month ASC
            LIMIT $2
        `;
        const { rows } = await db.query(query, [userId, limit]);
        return rows;
    },

    async getNetFlowTrend(userId) {
        const query = `
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_flow
            FROM transactions
            WHERE user_id = $1
            GROUP BY month
            ORDER BY month ASC
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    async getCategorySpending(userId, categoryId, { startDate, endDate }) {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as current_spending
            FROM transactions
            WHERE user_id = $1 AND category_id = $2 AND date >= $3 AND date <= $4 AND type = 'expense';
        `;
        const { rows } = await db.query(query, [userId, categoryId, startDate, endDate]);
        return rows[0].current_spending;
    }
};

module.exports = Transaction;
