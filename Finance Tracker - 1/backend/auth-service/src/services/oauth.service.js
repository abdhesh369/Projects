const oauthService = {
    async getAuthUrl(provider) {
        console.log(`[Auth] OAuth: Getting auth URL for ${provider}`);
        return `https://${provider}.com/oauth/authorize?client_id=...`;
    },

    async handleCallback(provider, code) {
        console.log(`[Auth] OAuth: Handling callback for ${provider} with code ${code}`);
        return {
            email: 'oauth_user@example.com',
            providerId: 'OAUTH_ID_PLACEHOLDER',
            provider
        };
    }
};

module.exports = oauthService;
