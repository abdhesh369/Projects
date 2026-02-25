const logger = require('../../../shared/utils/logger');
const emailService = require('../services/email.service');
const pushService = require('../services/push.service');
const inAppService = require('../services/in-app.service');
const smsService = require('../services/sms.service');
const realtimeService = require('../services/realtime.service');

const notificationController = {
    async sendNotification(req, res) {
        try {
            const { type, recipient, content, data } = req.body;

            let result;
            switch (type) {
                case 'email':
                    result = await emailService.sendEmail({ to: recipient, ...content });
                    break;
                case 'push':
                    result = await pushService.sendPushNotification({ userId: recipient, ...content });
                    break;
                case 'in-app':
                    result = await inAppService.createNotification({ userId: recipient, ...content });
                    // Push real-time alert to connected clients
                    realtimeService.sendNotificationAlert(recipient, result);
                    break;
                case 'sms':
                    result = await smsService.sendSms({ to: recipient, ...content });
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid notification type' });
            }

            res.status(200).json(result);
        } catch (error) {
            logger.error('[Notification] Error sending notification:', error);
            res.status(500).json({ error: 'Failed to send notification' });
        }
    },

    async list(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await inAppService.getUserNotifications(userId);
            res.status(200).json(notifications);
        } catch (error) {
            logger.error('[Notification] Error listing notifications:', error);
            res.status(500).json({ error: 'Failed to list notifications' });
        }
    },

    async markRead(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const notification = await inAppService.markAsRead(id, userId);
            res.status(200).json(notification);
        } catch (error) {
            logger.error('[Notification] Error marking notification as read:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    }
};

module.exports = notificationController;
