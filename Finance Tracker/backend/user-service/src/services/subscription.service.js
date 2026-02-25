const logger = require('../../../shared/utils/logger');
const stripeService = require('./stripe.service');
const User = require('../models/user.model');

const subscriptionService = {
    async getSubscriptionStatus(userId) {
        const user = await User.findById(userId);

        let details = null;
        if (user.stripe_customer_id && user.subscription_status === 'active') {
            try {
                const subscriptions = await stripeService.getSubscriptions(user.stripe_customer_id);
                if (subscriptions && subscriptions.length > 0) {
                    details = subscriptions[0];
                }
            } catch (error) {
                logger.error('Error fetching subscription details from Stripe:', error);
                // Non-fatal, return DB status
            }
        }

        return {
            plan: user.subscription_plan || 'free',
            status: user.subscription_status || 'inactive',
            details
        };
    },

    async createCheckoutSession(userId, priceId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const customer = await stripeService.getOrCreateCustomer(
            userId,
            user.email,
            `${user.first_name || ''} ${user.last_name || ''}`.trim()
        );

        // Link customer to user if not already linked
        if (!user.stripe_customer_id) {
            await User.updateProfile(userId, { stripe_customer_id: customer.id });
        }

        const session = await stripeService.createCheckoutSession(customer.id, priceId, userId);
        return { url: session.url };
    },

    async createPortalSession(userId) {
        const user = await User.findById(userId);
        if (!user || !user.stripe_customer_id) {
            throw new Error('User does not have an active subscription');
        }

        const session = await stripeService.createPortalSession(user.stripe_customer_id);
        return { url: session.url };
    },

    async getBillingHistory(userId) {
        const user = await User.findById(userId);
        if (!user || !user.stripe_customer_id) {
            return [];
        }

        return await stripeService.getInvoices(user.stripe_customer_id);
    }
};

module.exports = subscriptionService;
