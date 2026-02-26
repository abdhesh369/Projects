const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
// Health check (Public)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'transaction-service' });
});

// Apply auth middleware to all protected routes
router.post('/sync', transactionController.sync); // Internal/Sync endpoint
router.use(authMiddleware);

router.post('/', transactionController.create);
router.post('/import', transactionController.import);
router.get('/', transactionController.list);
router.get('/recent', transactionController.getRecent);
router.get('/recurring', transactionController.listRecurring);
router.post('/recurring', transactionController.createRecurring);
router.get('/summary', transactionController.getSummary);
router.get('/categories/breakdown', transactionController.getCategoryBreakdown);
router.get('/categories/:categoryId/spending', transactionController.getCategorySpending);
router.get('/trends/spending', transactionController.getSpendingTrend);
router.get('/trends/income-vs-expenses', transactionController.getIncomeVsExpenses);
router.get('/trends/net-flow', transactionController.getNetFlowTrend);
router.get('/:id', transactionController.get);
router.patch('/:id', transactionController.update);
router.delete('/:id', transactionController.delete);

module.exports = router;
