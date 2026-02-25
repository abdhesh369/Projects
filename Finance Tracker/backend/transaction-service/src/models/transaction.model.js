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
        let whereClause = 'WHERE t.user_id = $1';
        const values = [userId];
        let paramCount = 1;

        if (startDate) {
            paramCount++;
            whereClause += ` AND t.date >= $${paramCount}`;
            values.push(startDate);
        }
        if (endDate) {
            paramCount++;
            whereClause += ` AND t.date <= $${paramCount}`;
            values.push(endDate);
        }
        if (categoryId) {
            paramCount++;
            whereClause += ` AND t.category_id = $${paramCount}`;
            values.push(categoryId);
        }
        if (type) {
            paramCount++;
            whereClause += ` AND t.type = $${paramCount}`;
            values.push(type);
        }

        const totalQuery = `SELECT COUNT(*) FROM transactions t ${whereClause}`;
        const { rows: countRows } = await db.query(totalQuery, values);
        const total = parseInt(countRows[0].count);

        const dataQuery = `
            SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            ${whereClause}
            ORDER BY t.date DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;
        const { rows: transactions } = await db.query(dataQuery, [...values, limit, offset]);

        return { transactions, total };
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
        // Fix Issue #14: Return most recent L months sorted chronologically
        const query = `
            SELECT * FROM (
                SELECT 
                    TO_CHAR(date, 'YYYY-MM') as month,
                    SUM(amount) as value
                FROM transactions
                WHERE user_id = $1 AND type = 'expense'
                GROUP BY month
                ORDER BY month DESC
                LIMIT $2
            ) sub
            ORDER BY month ASC
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
    },

    async bulkSync(userId, { added, modified, removed }) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Handle Added (Upsert)
            if (added && added.length > 0) {
                for (const txn of added) {
                    const query = `
                        INSERT INTO transactions (
                            user_id, account_id, amount, type, description, 
                            date, plaid_transaction_id, pending
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (plaid_transaction_id) 
                        DO UPDATE SET 
                            amount = EXCLUDED.amount,
                            description = EXCLUDED.description,
                            date = EXCLUDED.date,
                            pending = EXCLUDED.pending,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING id;
                    `;
                    // Note: We might need to map plaid_account_id to internal account_id
                    // For now, assuming internal account_id is passed or handled
                    await client.query(query, [
                        userId, txn.account_id, txn.amount, txn.type || 'expense',
                        txn.name || txn.description, txn.date, txn.plaid_transaction_id, txn.pending || false
                    ]);
                }
            }

            // 2. Handle Modified
            if (modified && modified.length > 0) {
                for (const txn of modified) {
                    const query = `
                        UPDATE transactions 
                        SET amount = $1, description = $2, pending = $3, updated_at = CURRENT_TIMESTAMP
                        WHERE plaid_transaction_id = $4 AND user_id = $5;
                    `;
                    await client.query(query, [txn.amount, txn.name || txn.description, txn.pending, txn.plaid_transaction_id, userId]);
                }
            }

            // 3. Handle Removed
            if (removed && removed.length > 0) {
                const plaidIds = removed.map(txn => txn.plaid_transaction_id);
                await client.query('DELETE FROM transactions WHERE plaid_transaction_id = ANY($1) AND user_id = $2', [plaidIds, userId]);
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = Transaction;
