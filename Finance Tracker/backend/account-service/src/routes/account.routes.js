const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', accountController.createAccount);
router.get('/', accountController.getAllAccounts);
router.get('/total-balance', accountController.getTotalBalance);
router.get('/:id', accountController.getAccountById);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
