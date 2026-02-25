const logger = require('../../../shared/utils/logger');
const axios = require('axios');

const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3009';
const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

const forecastingService = require('../services/forecasting.service');
const insightsService = require('../services/insights.service');
const trendDetectionService = require('../services/trend-detection.service');

const analyticsController = {
    async getSummary(req, res) {
        try {
            const userId = req.user.id;
            const headers = { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN, 'X-User-Id': userId };

            // Total Balance (from account-service)
            const balanceResponse = await axios.get(`${ACCOUNT_SERVICE_URL}/total-balance`, { headers });
            const totalBalance = parseFloat(balanceResponse.data.total_balance) || 0;

            // Income and Expenses (from transaction-service)
            // We'll use the /summary endpoint which returns {total_income, total_expenses, net_balance}
            const statsResponse = await axios.get(`${TRANSACTION_SERVICE_URL}/summary`, { headers });
            const { total_income, total_expenses } = statsResponse.data;

            const totalIncome = parseFloat(total_income) || 0;
            const totalExpenses = parseFloat(total_expenses) || 0;

            // Savings Rate
            const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

            res.status(200).json({
                totalBalance,
                totalIncome,
                totalExpenses,
                savingsRate: Math.round(savingsRate * 100) / 100
            });
        } catch (error) {
            logger.error('Analytics summary error:', error.message);
            res.status(500).json({ error: 'Failed to fetch analytics summary' });
        }
    },

    async getCategoryBreakdown(req, res) {
        try {
            const userId = req.user.id;
            const headers = { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN, 'X-User-Id': userId };

            // Call transaction-service/categories/breakdown
            const response = await axios.get(`${TRANSACTION_SERVICE_URL}/categories/breakdown`, { headers });
            const rows = response.data;

            const totalExpense = rows.reduce((acc, row) => acc + parseFloat(row.amount), 0);

            const breakdown = rows.map(row => ({
                ...row,
                amount: parseFloat(row.amount),
                percentage: totalExpense > 0 ? Math.round((parseFloat(row.amount) / totalExpense) * 10000) / 100 : 0
            }));

            res.status(200).json(breakdown);
        } catch (error) {
            logger.error('Category breakdown error:', error.message);
            res.status(500).json({ error: 'Failed to fetch category breakdown' });
        }
    },

    async getSpendingTrend(req, res) {
        try {
            const userId = req.user.id;
            const headers = { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN, 'X-User-Id': userId };

            const response = await axios.get(`${TRANSACTION_SERVICE_URL}/trends/spending`, { headers });
            const trend = response.data.map(row => ({
                date: row.month,
                value: parseFloat(row.value)
            }));

            res.status(200).json(trend);
        } catch (error) {
            logger.error('Spending trend error:', error.message);
            res.status(500).json({ error: 'Failed to fetch spending trend' });
        }
    },

    async getIncomeVsExpenses(req, res) {
        try {
            const userId = req.user.id;
            const headers = { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN, 'X-User-Id': userId };

            const response = await axios.get(`${TRANSACTION_SERVICE_URL}/trends/income-vs-expenses`, { headers });
            const result = response.data.map(row => ({
                month: row.month,
                income: parseFloat(row.income),
                expenses: parseFloat(row.expenses)
            }));
            res.status(200).json(result);
        } catch (error) {
            logger.error('Income vs Expenses error:', error.message);
            res.status(500).json({ error: 'Failed to fetch income vs expenses' });
        }
    },

    async getAccountBalanceTrend(req, res) {
        try {
            const userId = req.user.id;
            const headers = { 'X-Internal-Token': INTERNAL_SERVICE_TOKEN, 'X-User-Id': userId };

            // 1. Get net flow trend from transaction-service
            const netFlowResponse = await axios.get(`${TRANSACTION_SERVICE_URL}/trends/net-flow`, { headers });
            const rows = netFlowResponse.data;

            // 2. Get current total balance from account-service
            const balanceResponse = await axios.get(`${ACCOUNT_SERVICE_URL}/total-balance`, { headers });
            let currentBalance = parseFloat(balanceResponse.data.total_balance) || 0;

            const trend = [];
            // We iterate backwards from current month
            const sortedRows = [...rows].reverse();
            for (const row of sortedRows) {
                trend.push({
                    month: row.month,
                    balance: currentBalance
                });
                currentBalance -= parseFloat(row.net_flow);
            }

            res.status(200).json(trend.reverse());
        } catch (error) {
            logger.error('Account balance trend error:', error.message);
            res.status(500).json({ error: 'Failed to fetch balance trend' });
        }
    },

    async getForecasting(req, res) {
        try {
            const userId = req.user.id;
            const forecast = await forecastingService.predictNextMonthSpending(userId);
            res.status(200).json(forecast);
        } catch (error) {
            logger.error('Forecasting error:', error.message);
            res.status(500).json({ error: 'Failed to generate spending forecast' });
        }
    },

    async getInsights(req, res) {
        try {
            const userId = req.user.id;
            const insights = await insightsService.generateInsights(userId);
            res.status(200).json(insights);
        } catch (error) {
            logger.error('Insights error:', error.message);
            res.status(500).json({ error: 'Failed to generate spending insights' });
        }
    },

    async getTrends(req, res) {
        try {
            const userId = req.user.id;
            const trends = await trendDetectionService.detectSpendingTrends(userId);
            res.status(200).json(trends);
        } catch (error) {
            logger.error('Trend detection error:', error.message);
            res.status(500).json({ error: 'Failed to detect spending trends' });
        }
    }
};

module.exports = analyticsController;
