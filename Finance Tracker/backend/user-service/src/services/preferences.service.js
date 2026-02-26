const User = require('../models/user.model');
const logger = require('../../../shared/utils/logger');

const preferencesService = {
    async getPreferences(userId) {
        try {
            const user = await User.findById(userId);
            return user?.preferences || {
                currency: 'USD',
                theme: 'light',
                notifications: true
            };
        } catch (error) {
            logger.error(`Error in getPreferences for user ${userId}:`, error);
            throw error;
        }
    },

    async updatePreferences(userId, preferences) {
        try {
            return await User.updatePreferences(userId, preferences);
        } catch (error) {
            logger.error(`Error in updatePreferences for user ${userId}:`, error);
            throw error;
        }
    }
};

module.exports = preferencesService;
