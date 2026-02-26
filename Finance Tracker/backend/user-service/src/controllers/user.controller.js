const logger = require('../../../shared/utils/logger');
const User = require('../models/user.model');
const stripeService = require('../services/stripe.service');

const userController = {
    async getMe(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            logger.error('Fetch profile error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    async updateProfile(req, res) {
        try {
            const { firstName, lastName } = req.body;
            if (!firstName || !lastName) {
                return res.status(400).json({ error: 'First name and last name are required' });
            }

            const updatedUser = await User.updateProfile(req.user.id, { first_name: firstName, last_name: lastName });
            res.status(200).json(updatedUser);
        } catch (error) {
            logger.error('Update profile error:', error);
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
            logger.error('Update preferences error:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    },

    async getSubscription(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });

            res.status(200).json({
                plan: user.subscription_plan || 'free',
                status: user.subscription_status || 'active',
                expiryDate: user.subscription_expiry
            });
        } catch (error) {
            logger.error('Get subscription error:', error);
            res.status(500).json({ error: 'Failed to fetch subscription' });
        }
    },

    async createCheckout(req, res) {
        try {
            const { priceId } = req.body;
            const user = await User.findById(req.user.id);
            const customer = await stripeService.getOrCreateCustomer(user.id, user.email, `${user.first_name || ''} ${user.last_name || ''}`.trim());
            const session = await stripeService.createCheckoutSession(customer.id, priceId, user.id);
            res.status(200).json({ url: session.url });
        } catch (error) {
            logger.error('Create checkout error:', error);
            res.status(500).json({ error: 'Failed to create checkout' });
        }
    },

    async createPortal(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user.stripe_customer_id) {
                return res.status(400).json({ error: 'No billing profile found' });
            }
            const session = await stripeService.createPortalSession(user.stripe_customer_id);
            res.status(200).json({ url: session.url });
        } catch (error) {
            logger.error('Create portal error:', error);
            res.status(500).json({ error: 'Failed to create portal' });
        }
    },

    async getBillingHistory(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user.stripe_customer_id) {
                return res.status(200).json([]);
            }
            const invoices = await stripeService.getInvoices(user.stripe_customer_id);
            res.status(200).json(invoices);
        } catch (error) {
            logger.error('Get billing history error:', error);
            res.status(500).json({ error: 'Failed to fetch billing history' });
        }
    }
};

module.exports = userController;
