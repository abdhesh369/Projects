const User = require('./user.model');
const logger = require('../../../shared/utils/logger');

/**
 * Preferences mirror the JSONB structure in the users table.
 */
const PreferencesModel = {
    async findByUserId(userId) {
        try {
            const user = await User.findById(userId);
            return user?.preferences || {
                currency: 'USD',
                theme: 'light',
                notifications: {
                    email: true,
                    push: true,
                    sms: false
                }
            };
        } catch (error) {
            logger.error(`Error finding preferences for user ${userId}:`, error);
            throw error;
        }
    },

    async update(userId, preferences) {
        try {
            return await User.updatePreferences(userId, preferences);
        } catch (error) {
            logger.error(`Error updating preferences for user ${userId}:`, error);
            throw error;
        }
    }
};

module.exports = PreferencesModel;
