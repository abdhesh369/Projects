const User = require('../models/user.model');

const userController = {
    async getMe(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error('Fetch profile error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    async updateProfile(req, res) {
        try {
            const { firstName, lastName } = req.body;
            if (!firstName || !lastName) {
                return res.status(400).json({ error: 'First name and last name are required' });
            }

            const updatedUser = await User.updateProfile(req.user.id, { firstName, lastName });
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    },

    async updatePreferences(req, res) {
        try {
            const { currency, theme, notifications } = req.body;
            const preferences = {};
            if (currency !== undefined) preferences.currency = currency;
            if (theme !== undefined) preferences.theme = theme;
            if (notifications !== undefined) preferences.notifications = notifications;

            const updatedUser = await User.updatePreferences(req.user.id, preferences);
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Update preferences error:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    }
};

module.exports = userController;
