const db = require('../config/db');

const reportGenerationService = {
    async generateSummary(userId, { startDate, endDate }) {
        const query = `
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as net_balance
            FROM transactions
            WHERE user_id = $1 AND date >= $2 AND date <= $3;
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
            ORDER BY amount DESC;
        `;
        const { rows } = await db.query(query, [userId, startDate, endDate]);
        return rows;
    }
};

module.exports = reportGenerationService;
