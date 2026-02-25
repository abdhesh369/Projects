const stripeService = require('../services/stripe.service');

const billingController = {
    /**
     * POST /billing/checkout
     * Creates a Stripe Checkout session for a new subscription.
     */
    async createCheckout(req, res) {
        try {
            const userId = req.user.id;
            const { email, name, priceId } = req.body;

            if (!priceId) {
                return res.status(400).json({ error: 'priceId is required' });
            }

            const customer = await stripeService.getOrCreateCustomer(userId, email, name);
            const session = await stripeService.createCheckoutSession(customer.id, priceId, userId);

            res.status(200).json({ url: session.url, sessionId: session.id });
        } catch (error) {
            console.error('[Billing] Checkout error:', error.message);
            res.status(500).json({ error: 'Failed to create checkout session' });
        }
    },

    /**
     * POST /billing/portal
     * Creates a Stripe Customer Portal session for self-serve management.
     */
    async createPortal(req, res) {
        try {
            const userId = req.user.id;
            const { email, name } = req.body;

            const customer = await stripeService.getOrCreateCustomer(userId, email, name);
            const session = await stripeService.createPortalSession(customer.id);

            res.status(200).json({ url: session.url });
        } catch (error) {
            console.error('[Billing] Portal error:', error.message);
            res.status(500).json({ error: 'Failed to create portal session' });
        }
    },

    /**
     * GET /billing/subscriptions
     * Fetches the user's active subscriptions.
     */
    async getSubscriptions(req, res) {
        try {
            const userId = req.user.id;
            const { email, name } = req.query;

            const customer = await stripeService.getOrCreateCustomer(userId, email, name);
            const subscriptions = await stripeService.getSubscriptions(customer.id);

            res.status(200).json({ subscriptions });
        } catch (error) {
            console.error('[Billing] getSubscriptions error:', error.message);
            res.status(500).json({ error: 'Failed to fetch subscriptions' });
        }
    },

    /**
     * POST /billing/subscriptions/:id/cancel
     * Cancels a subscription at the end of the billing period.
     */
    async cancelSubscription(req, res) {
        try {
            const { id } = req.params;
            const result = await stripeService.cancelSubscription(id);
            res.status(200).json({ message: 'Subscription will cancel at period end', subscription: result.id });
        } catch (error) {
            console.error('[Billing] cancel error:', error.message);
            res.status(500).json({ error: 'Failed to cancel subscription' });
        }
    },

    /**
     * POST /billing/subscriptions/:id/resume
     * Resumes a cancelled subscription (before period end).
     */
    async resumeSubscription(req, res) {
        try {
            const { id } = req.params;
            const result = await stripeService.resumeSubscription(id);
            res.status(200).json({ message: 'Subscription resumed', subscription: result.id });
        } catch (error) {
            console.error('[Billing] resume error:', error.message);
            res.status(500).json({ error: 'Failed to resume subscription' });
        }
    },

    /**
     * GET /billing/invoices
     * Fetches the user's billing history (invoices).
     */
    async getInvoices(req, res) {
        try {
            const userId = req.user.id;
            const { email, name } = req.query;
            const limit = parseInt(req.query.limit) || 10;

            const customer = await stripeService.getOrCreateCustomer(userId, email, name);
            const invoices = await stripeService.getInvoices(customer.id, limit);

            res.status(200).json({ invoices });
        } catch (error) {
            console.error('[Billing] getInvoices error:', error.message);
            res.status(500).json({ error: 'Failed to fetch invoices' });
        }
    },

    /**
     * POST /billing/webhook
     * Handles Stripe webhook events. Uses raw body for signature verification.
     */
    async handleWebhook(req, res) {
        try {
            const signature = req.headers['stripe-signature'];
            const result = await stripeService.handleWebhookEvent(req.body, signature);
            res.status(200).json(result);
        } catch (error) {
            console.error('[Billing] Webhook error:', error.message);
            res.status(400).json({ error: `Webhook Error: ${error.message}` });
        }
    }
};

module.exports = billingController;
