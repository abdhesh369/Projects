const User = require('../models/user.model');
const logger = require('../../../shared/utils/logger');

const profileService = {
    async getProfile(userId) {
        try {
            return await User.findById(userId);
        } catch (error) {
            logger.error(`Error in getProfile for user ${userId}:`, error);
            throw error;
        }
    },

    async updateProfile(userId, data) {
        try {
            // Filter allowed fields
            const allowedFields = ['first_name', 'last_name', 'avatar'];
            const updates = {};

            if (data.firstName) updates.first_name = data.firstName;
            if (data.lastName) updates.last_name = data.lastName;
            if (data.avatar) updates.avatar = data.avatar;

            if (Object.keys(updates).length === 0) return null;

            return await User.updateProfile(userId, updates);
        } catch (error) {
            logger.error(`Error in updateProfile for user ${userId}:`, error);
            throw error;
        }
    }
};

module.exports = profileService;
