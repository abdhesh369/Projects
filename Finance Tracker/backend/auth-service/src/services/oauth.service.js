const logger = require('../../../shared/utils/logger');
const axios = require('axios');

const oauthService = {
    async getAuthUrl(provider) {
        if (provider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const redirectUri = process.env.GOOGLE_REDIRECT_URI;
            if (!clientId || !redirectUri) {
                console.warn('[Auth] GOOGLE_CLIENT_ID missing. Simulating URL.');
                return 'https://accounts.google.com/o/oauth2/v2/auth?client_id=simulated';
            }
            return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
        }
        logger.info(`[Auth] OAuth: Getting auth URL for ${provider}`);
        return `https://${provider}.com/oauth/authorize?client_id=...`;
    },

    async handleCallback(provider, code) {
        logger.info(`[Auth] OAuth: Handling callback for ${provider} with code ${code}`);

        if (provider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = process.env.GOOGLE_REDIRECT_URI;

            if (!clientId || !clientSecret || !redirectUri) {
                console.warn('[Auth] Google OAuth credentials missing. Simulating exchange.');
                return {
                    email: `simulated_user_${code}@example.com`,
                    firstName: 'Simulated',
                    lastName: 'User',
                    providerId: `simulated_${code}`
                };
            }

            try {
                const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                });

                const { access_token } = tokenResponse.data;
                const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` }
                });

                return {
                    email: userResponse.data.email,
                    firstName: userResponse.data.given_name || '',
                    lastName: userResponse.data.family_name || '',
                    providerId: userResponse.data.id
                };
            } catch (error) {
                logger.error('[Auth] Google OAuth Error:', error.response?.data || error.message);
                throw new Error('Failed to exchange OAuth code');
            }
        }

        throw new Error(`OAuth exchange for ${provider} not implemented.`);
    }
};

module.exports = oauthService;
