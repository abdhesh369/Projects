const logger = require('../../../shared/utils/logger');
const admin = require('firebase-admin');

// Initialize Firebase Admin
let initialized = false;
try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        initialized = true;
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp();
        initialized = true;
    }
} catch (error) {
    logger.error('[Notification] Firebase Admin init error:', error);
}

const pushService = {
    async sendPushNotification({ userId, title, body, data }) {
        logger.info(`[Notification] Sending Push to User ${userId}: ${title}`);

        if (!initialized) {
            console.warn('[Notification] Firebase not configured. Simulating push.');
            return { success: true, pushId: `sim_push_${Date.now()}` };
        }

        const topic = `user_${userId}`;
        const message = {
            notification: { title, body },
            data: data || {},
            topic
        };

        try {
            const response = await admin.messaging().send(message);
            return { success: true, pushId: response };
        } catch (error) {
            logger.error('[Notification] Firebase Push Error:', error.message);
            throw new Error('Failed to send push notification');
        }
    },

    async sendTransactionAlert(userId, amount) {
        return await this.sendPushNotification({
            userId,
            title: 'Large Transaction Alert',
            body: `A transaction of $${amount} was recorded on your account.`
        });
    }
};

module.exports = pushService;
