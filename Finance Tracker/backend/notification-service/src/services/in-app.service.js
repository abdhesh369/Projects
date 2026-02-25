const logger = require('../../../shared/utils/logger');
const db = require('../config/db');

const inAppService = {
    async createNotification({ userId, title, message, type }) {
        const query = `
            INSERT INTO notifications (user_id, title, message, type, is_read)
            VALUES ($1, $2, $3, $4, FALSE)
            RETURNING *;
        `;
        const values = [userId, title || 'Notification', message, type || 'info'];

        try {
            const { rows } = await db.query(query, values);
            logger.info(`[Notification] Saved In-App Notification for User ${userId}`);
            return rows[0];
        } catch (error) {
            logger.error('[Notification] DB Error saving in-app notification:', error);
            throw error;
        }
    },

    async markAsRead(notificationId, userId) {
        const query = 'UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await db.query(query, [notificationId, userId]);
        return rows[0];
    },

    async getUserNotifications(userId) {
        const query = 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
};

module.exports = inAppService;
