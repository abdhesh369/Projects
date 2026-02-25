const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const redis = require('../config/redis');

const PENDING_MFA_TTL = 300; // 5 minutes

const mfaService = {
    async generateSecret(userId) {
        console.log(`[Auth] MFA: Generating secret for user ${userId}`);
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(userId, 'FinanceTracker', secret);
        const qrCode = await qrcode.toDataURL(otpauth);

        // Store pending secret in Redis
        await redis.set(`mfa:pending:${userId}`, secret, 'EX', PENDING_MFA_TTL);

        return {
            secret, // Still returning for QR display, but verifyMFA won't accept it back from client
            qrCode
        };
    },

    async getPendingSecret(userId) {
        return await redis.get(`mfa:pending:${userId}`);
    },

    async clearPendingSecret(userId) {
        await redis.del(`mfa:pending:${userId}`);
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
        return true;
    }
};

module.exports = mfaService;
