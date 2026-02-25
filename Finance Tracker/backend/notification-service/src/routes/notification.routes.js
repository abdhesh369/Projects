const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Health check (Public)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'notification-service' });
});

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

router.post('/send', notificationController.sendNotification);
router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
