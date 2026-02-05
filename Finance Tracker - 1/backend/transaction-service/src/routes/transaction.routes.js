const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.post('/', transactionController.create);
router.get('/', transactionController.list);
router.get('/:id', transactionController.get);
router.patch('/:id', transactionController.update);
router.delete('/:id', transactionController.delete);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'transaction-service' });
});

module.exports = router;
