const stripeService = require('./stripe.service');
const User = require('../models/user.model');

// Mock User Model
jest.mock('../models/user.model', () => ({
    updateSubscription: jest.fn(),
    updateProfile: jest.fn()
}));

// Mock Stripe library
jest.mock('stripe', () => {
    const mStripe = {
        webhooks: {
            constructEvent: jest.fn()
        }
    };
    return jest.fn(() => mStripe);
});

const Stripe = require('stripe');

describe('Stripe Service - Webhooks', () => {
    let stripeInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        stripeInstance = new Stripe();
    });

    it('should handle invoice.paid and activate subscription', async () => {
        const mockEvent = {
            type: 'invoice.paid',
            data: {
                object: {
                    customer: 'cus_123',
                    subscription: 'sub_123'
                }
            }
        };

        stripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

        const result = await stripeService.handleWebhookEvent('rawBody', 'signature');

        expect(User.updateSubscription).toHaveBeenCalledWith('cus_123', {
            subscriptionId: 'sub_123',
            plan: 'premium',
            status: 'active'
        });
        expect(result).toEqual({ received: true });
    });

    it('should handle customer.subscription.deleted and cancel subscription', async () => {
        const mockEvent = {
            type: 'customer.subscription.deleted',
            data: {
                object: {
                    customer: 'cus_123'
                }
            }
        };

        stripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

        await stripeService.handleWebhookEvent('rawBody', 'signature');

        expect(User.updateSubscription).toHaveBeenCalledWith('cus_123', {
            subscriptionId: null,
            status: 'canceled',
            plan: 'free'
        });
    });
});
