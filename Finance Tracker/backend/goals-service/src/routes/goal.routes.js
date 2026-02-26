const express = require('express');
const goalController = require('../controllers/goal.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate } = require('../../../shared/utils/request-validator');

const router = express.Router();

const goalSchema = {
    name: { type: 'string', required: true, minLength: 3, maxLength: 255 },
    target_amount: { type: 'number', required: true, min: 0.01 },
    currency: { type: 'string', regex: /^[A-Z]{3}$/ },
    target_date: { type: 'date', required: true },
    category: { type: 'string' }
};

const contributionSchema = {
    amount: { type: 'number', required: true, min: 0.01 }
};

router.use(authMiddleware);

router.post('/', validate(goalSchema), goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoalById);
router.put('/:id', validate(goalSchema), goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/:id/contribute', validate(contributionSchema), goalController.contribute);

module.exports = router;
