import api from './api';

export const plaidService = {
    async createLinkToken(): Promise<string> {
        const response = await api.get('/api/banking/link-token');
        return response.data.link_token;
    },

    async exchangePublicToken(publicToken: string, institutionId: string, institutionName: string): Promise<any> {
        const response = await api.post('/api/banking/link-token/exchange', {
            public_token: publicToken,
            institution_id: institutionId,
            institution_name: institutionName
        });
        return response.data;
    }
};
