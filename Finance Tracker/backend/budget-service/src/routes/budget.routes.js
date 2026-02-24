const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post('/', budgetController.create);
router.get('/', budgetController.list);
router.patch('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'budget-service' });
});

module.exports = router;
