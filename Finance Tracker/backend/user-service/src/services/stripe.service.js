const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const stripe = new Stripe(STRIPE_SECRET_KEY);

const stripeService = {
    /**
     * Create or retrieve a Stripe customer for a user.
     */
    async getOrCreateCustomer(userId, email, name) {
        // Search for existing customer by metadata
        const existing = await stripe.customers.search({
            query: `metadata['user_id']:'${userId}'`,
        });

        if (existing.data.length > 0) {
            return existing.data[0];
        }

        // Create new customer
        const customer = await stripe.customers.create({
            email,
            name,
            metadata: { user_id: userId.toString() },
        });

        return customer;
    },

    /**
     * Create a Stripe Checkout session for subscription.
     */
    async createCheckoutSession(customerId, priceId, userId) {
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${FRONTEND_URL}/settings?billing=success`,
            cancel_url: `${FRONTEND_URL}/settings?billing=cancelled`,
            metadata: { user_id: userId.toString() },
        });

        return session;
    },

    /**
     * Create a Stripe Customer Portal session for managing subscriptions.
     */
    async createPortalSession(customerId) {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${FRONTEND_URL}/settings`,
        });

        return session;
    },

    /**
     * Get active subscriptions for a customer.
     */
    async getSubscriptions(customerId) {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            limit: 10,
        });

        return subscriptions.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            plan: sub.items.data[0]?.price?.nickname || sub.items.data[0]?.price?.id || 'Unknown',
            amount: sub.items.data[0]?.price?.unit_amount / 100,
            currency: sub.items.data[0]?.price?.currency,
            interval: sub.items.data[0]?.price?.recurring?.interval,
            current_period_start: new Date(sub.current_period_start * 1000),
            current_period_end: new Date(sub.current_period_end * 1000),
            cancel_at_period_end: sub.cancel_at_period_end,
        }));
    },

    /**
     * Cancel a subscription at period end.
     */
    async cancelSubscription(subscriptionId) {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
        return subscription;
    },

    /**
     * Resume a cancelled subscription (before period end).
     */
    async resumeSubscription(subscriptionId) {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
        return subscription;
    },

    /**
     * Get invoices for a customer (billing history).
     */
    async getInvoices(customerId, limit = 10) {
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit,
        });

        return invoices.data.map(inv => ({
            id: inv.id,
            number: inv.number,
            amount_due: inv.amount_due / 100,
            amount_paid: inv.amount_paid / 100,
            currency: inv.currency,
            status: inv.status,
            created: new Date(inv.created * 1000),
            hosted_invoice_url: inv.hosted_invoice_url,
            invoice_pdf: inv.invoice_pdf,
        }));
    },

    /**
     * Handle Stripe webhook events.
     */
    async handleWebhookEvent(rawBody, signature) {
        const event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);

        switch (event.type) {
            case 'checkout.session.completed':
                console.log('[Stripe] Checkout session completed:', event.data.object.id);
                break;
            case 'invoice.paid':
                console.log('[Stripe] Invoice paid:', event.data.object.id);
                break;
            case 'invoice.payment_failed':
                console.log('[Stripe] Invoice payment failed:', event.data.object.id);
                break;
            case 'customer.subscription.updated':
                console.log('[Stripe] Subscription updated:', event.data.object.id);
                break;
            case 'customer.subscription.deleted':
                console.log('[Stripe] Subscription deleted:', event.data.object.id);
                break;
            default:
                console.log(`[Stripe] Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }
};

module.exports = stripeService;
