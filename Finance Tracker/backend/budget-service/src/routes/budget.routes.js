const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
// Health check (Public)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'budget-service' });
});

// Apply auth middleware to all protected routes
router.use(authMiddleware);

router.post('/', budgetController.create);
router.get('/', budgetController.list);
router.get('/tracking', budgetController.getTrackingSummary);
router.get('/alerts', budgetController.getAlerts);
router.patch('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

module.exports = router;
