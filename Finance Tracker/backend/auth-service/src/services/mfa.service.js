const { authenticator } = require('otplib');
const qrcode = require('qrcode');

const mfaService = {
    async generateSecret(userId) {
        console.log(`[Auth] MFA: Generating secret for user ${userId}`);
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(userId, 'FinanceTracker', secret);
        const qrCode = await qrcode.toDataURL(otpauth);

        return {
            secret,
            qrCode
        };
    },

    async verifyCode(userId, code, secret) {
        console.log(`[Auth] MFA: Verifying code for user ${userId}`);

        if (!secret) {
            console.error('[Auth] MFA: Verification failed - secret missing');
            return false;
        }

        return authenticator.verify({
            token: code,
            secret: secret
        });
    },

    async enroll(userId) {
        console.log(`[Auth] MFA: Enrolling user ${userId}`);
        // In a real app, this would update the user's mfa_enabled flag in DB
        return true;
    }
};

module.exports = mfaService;
