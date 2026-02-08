const db = require('../config/db');

const analyticsController = {
    async getSummary(req, res) {
        try {
            const userId = req.user.id;

            // Total Balance (from accounts)
            const balanceQuery = 'SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = $1 AND is_active = TRUE';
            const { rows: balanceRows } = await db.query(balanceQuery, [userId]);
            const totalBalance = parseFloat(balanceRows[0].total_balance) || 0;

            // Income and Expenses (from transactions)
            const statsQuery = `
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
                FROM transactions 
                WHERE user_id = $1
            `;
            const { rows: statsRows } = await db.query(statsQuery, [userId]);
            const totalIncome = parseFloat(statsRows[0].total_income) || 0;
            const totalExpenses = parseFloat(statsRows[0].total_expenses) || 0;

            // Savings Rate
            const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

            res.status(200).json({
                totalBalance,
                totalIncome,
                totalExpenses,
                savingsRate: Math.round(savingsRate * 100) / 100
            });
        } catch (error) {
            console.error('Analytics summary error:', error);
            res.status(500).json({ error: 'Failed to fetch analytics summary' });
        }
    },

    async getCategoryBreakdown(req, res) {
        try {
            const userId = req.user.id;

            const query = `
                SELECT 
                    c.id as category_id,
                    c.name as category_name,
                    c.color as color,
                    SUM(t.amount) as amount
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = $1 AND t.type = 'expense'
                GROUP BY c.id, c.name, c.color
                ORDER BY amount DESC
            `;
            const { rows } = await db.query(query, [userId]);

            const totalExpense = rows.reduce((acc, row) => acc + parseFloat(row.amount), 0);

            const breakdown = rows.map(row => ({
                ...row,
                amount: parseFloat(row.amount),
                percentage: totalExpense > 0 ? Math.round((parseFloat(row.amount) / totalExpense) * 10000) / 100 : 0
            }));

            res.status(200).json(breakdown);
        } catch (error) {
            console.error('Category breakdown error:', error);
            res.status(500).json({ error: 'Failed to fetch category breakdown' });
        }
    },

    async getSpendingTrend(req, res) {
        try {
            const userId = req.user.id;

            const query = `
                SELECT 
                    TO_CHAR(date, 'YYYY-MM') as month,
                    SUM(amount) as value
                FROM transactions
                WHERE user_id = $1 AND type = 'expense'
                GROUP BY month
                ORDER BY month ASC
                LIMIT 12
            `;
            const { rows } = await db.query(query, [userId]);

            const trend = rows.map(row => ({
                date: row.month,
                value: parseFloat(row.value)
            }));

            res.status(200).json(trend);
        } catch (error) {
            console.error('Spending trend error:', error);
            res.status(500).json({ error: 'Failed to fetch spending trend' });
        }
    }
};

module.exports = analyticsController;
