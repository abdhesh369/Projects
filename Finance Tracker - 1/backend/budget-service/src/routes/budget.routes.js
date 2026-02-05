const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');

router.post('/', budgetController.create);
router.get('/', budgetController.list);
router.patch('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'budget-service' });
});

module.exports = router;
