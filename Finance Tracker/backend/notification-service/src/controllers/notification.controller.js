const emailService = require('../services/email.service');
const pushService = require('../services/push.service');
const inAppService = require('../services/in-app.service');
const smsService = require('../services/sms.service');

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
                    break;
                case 'sms':
                    result = await smsService.sendSms({ to: recipient, ...content });
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid notification type' });
            }

            res.status(200).json(result);
        } catch (error) {
            console.error('[Notification] Error sending notification:', error);
            res.status(500).json({ error: 'Failed to send notification' });
        }
    }
};

module.exports = notificationController;
