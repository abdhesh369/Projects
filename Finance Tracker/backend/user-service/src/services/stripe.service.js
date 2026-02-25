const Stripe = require('stripe');
const User = require('../models/user.model');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Fix Issue #4: Enforce missing Stripe keys
if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.startsWith('sk_test_placeholder')) {
    console.error('FATAL: STRIPE_SECRET_KEY is not configured or using placeholder.');
    process.exit(1);
}

if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET.startsWith('whsec_placeholder')) {
    console.error('FATAL: STRIPE_WEBHOOK_SECRET is not configured or using placeholder.');
    process.exit(1);
}

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

        const data = event.data.object;

        switch (event.type) {
            case 'checkout.session.completed':
                if (data.mode === 'subscription') {
                    const userId = data.metadata.user_id;
                    const customerId = data.customer;
                    const subscriptionId = data.subscription;

                    // We need to link the customer ID to the user if not already done
                    await User.updateProfile(userId, { stripe_customer_id: customerId }); // Assuming updateProfile can handle this or use a generic update
                }
                break;

            case 'invoice.paid':
                await User.updateSubscription(data.customer, {
                    subscriptionId: data.subscription,
                    plan: 'premium', // Currently assuming single premium tier
                    status: 'active'
                });
                break;

            case 'invoice.payment_failed':
                await User.updateSubscription(data.customer, {
                    status: 'past_due'
                });
                break;

            case 'customer.subscription.updated':
                await User.updateSubscription(data.customer, {
                    subscriptionId: data.id,
                    status: data.status,
                    plan: data.items.data[0].price.nickname || 'premium'
                });
                break;

            case 'customer.subscription.deleted':
                await User.updateSubscription(data.customer, {
                    subscriptionId: null,
                    status: 'canceled',
                    plan: 'free'
                });
                break;

            default:
                console.log(`[Stripe] Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }
};

module.exports = stripeService;
