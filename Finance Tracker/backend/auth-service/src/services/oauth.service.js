const oauthService = {
    async getAuthUrl(provider) {
        console.log(`[Auth] OAuth: Getting auth URL for ${provider}`);
        return `https://${provider}.com/oauth/authorize?client_id=...`;
    },

    async handleCallback(provider, code) {
        console.log(`[Auth] OAuth: Handling callback for ${provider} with code ${code}`);

        // SECURITY: Removed placeholder email.
        // MUST implement real provider exchange (e.g. Google/GitHub API) here.
        throw new Error(`OAuth exchange for ${provider} not implemented.`);
    }
};

module.exports = oauthService;
