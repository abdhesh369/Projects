const logger = require('../../../shared/utils/logger');
const axios = require('axios');

const oauthService = {
    async getAuthUrl(provider) {
        if (provider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const redirectUri = process.env.GOOGLE_REDIRECT_URI;
            if (!clientId || !redirectUri) {
                throw new Error('Google OAuth credentials (CLIENT_ID/REDIRECT_URI) not configured');
            }
            return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
        }
        logger.info(`[Auth] OAuth: Getting auth URL for ${provider}`);
        throw new Error(`OAuth URL generation for ${provider} not implemented.`);
    },

    async handleCallback(provider, code) {
        logger.info(`[Auth] OAuth: Handling callback for ${provider} with code ${code}`);

        if (provider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = process.env.GOOGLE_REDIRECT_URI;

            if (!clientId || !clientSecret || !redirectUri) {
                throw new Error('Google OAuth credentials (CLIENT_ID/SECRET/URI) not configured');
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
