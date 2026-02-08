const mfaService = {
    async generateSecret(userId) {
        console.log(`[Auth] MFA: Generating secret for user ${userId}`);
        return {
            secret: 'MFA_SECRET_PLACEHOLDER',
            qrCode: 'QR_CODE_DATA_URL_PLACEHOLDER'
        };
    },

    async verifyCode(userId, code) {
        console.log(`[Auth] MFA: Verifying code ${code} for user ${userId}`);
        // Placeholder: assume code is always valid if it's '123456'
        return code === '123456';
    },

    async enroll(userId) {
        console.log(`[Auth] MFA: Enrolling user ${userId}`);
        return true;
    }
};

module.exports = mfaService;
