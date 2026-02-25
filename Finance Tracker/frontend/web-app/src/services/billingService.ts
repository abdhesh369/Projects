import api from './api';

export interface StripeSession {
    id: string;
    url: string;
}

export interface StripeInvoice {
    id: string;
    amount: number;
    status: string;
    date: string;
    pdfUrl: string;
}

export const billingService = {
    createCheckoutSession: async (priceId: string): Promise<StripeSession> => {
        const response = await api.post<StripeSession>('/api/billing/checkout', { priceId });
        return response.data;
    },

    createPortalSession: async (): Promise<StripeSession> => {
        const response = await api.post<StripeSession>('/api/billing/portal');
        return response.data;
    },

    getInvoices: async (): Promise<StripeInvoice[]> => {
        const response = await api.get<StripeInvoice[]>('/api/billing/invoices');
        return response.data;
    },

    getSubscription: async (): Promise<any> => {
        const response = await api.get('/api/billing/subscription');
        return response.data;
    },
};
