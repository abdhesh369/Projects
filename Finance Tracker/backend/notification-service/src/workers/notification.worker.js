const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

const notificationWorker = {
    async processQueue() {
        try {
            // Fetch pending notifications from the queue table
            const query = 'SELECT * FROM notification_queue WHERE status = $1 LIMIT 10';
            const { rows: pendingNotifications } = await db.query(query, ['pending']);

            for (const notification of pendingNotifications) {
                try {
                    logger.info(`Processing notification ${notification.id} of type ${notification.type}`);

                    let result;
                    if (notification.type === 'email') {
                        result = await this.sendEmail(notification.recipient, notification.subject, notification.content);
                    } else if (notification.type === 'sms') {
                        result = await this.sendSMS(notification.recipient, notification.content);
                    }

                    if (result && result.success) {
                        await db.query('UPDATE notification_queue SET status = $1, processed_at = NOW() WHERE id = $2', ['sent', notification.id]);
                    }
                } catch (err) {
                    logger.error(`Failed to process notification ${notification.id}:`, err);
                    await db.query('UPDATE notification_queue SET status = $1, error = $2 WHERE id = $3', ['failed', err.message, notification.id]);
                }
            }
        } catch (error) {
            logger.error('Notification worker queue processing error:', error);
        }
    },

    async sendEmail(to, subject, body) {
        return await emailService.sendEmail({
            to,
            subject,
            text: body
        });
    },

    async sendSMS(to, message) {
        return await smsService.sendSms({
            to,
            message
        });
    }
};

// Start the worker interval
setInterval(() => notificationWorker.processQueue(), 30000); // Process every 30 seconds

module.exports = notificationWorker;
