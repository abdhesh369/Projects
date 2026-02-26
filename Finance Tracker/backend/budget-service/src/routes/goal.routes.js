const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', goalController.create);
router.get('/', goalController.list);
router.get('/:id', goalController.get);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.delete);

module.exports = router;
