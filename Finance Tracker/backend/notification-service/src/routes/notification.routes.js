const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.post('/send', notificationController.sendNotification);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'notification-service' });
});

module.exports = router;
