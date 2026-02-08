const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/summary', analyticsController.getSummary);
router.get('/category-breakdown', analyticsController.getCategoryBreakdown);
router.get('/spending-trend', analyticsController.getSpendingTrend);

module.exports = router;
