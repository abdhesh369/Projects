const logger = require('../../../shared/utils/logger');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

const smsService = {
    async sendSms({ to, message }) {
        logger.info(`[Notification] Sending SMS to ${to}: ${message}`);

        if (!client) {
            console.warn('[Notification] Twilio client not configured. Simulating SMS.');
            return { success: true, sid: `sim_sms_${Date.now()}` };
        }

        try {
            const result = await client.messages.create({
                body: message,
                from: fromPhone,
                to: to
            });
            return { success: true, sid: result.sid };
        } catch (error) {
            logger.error('[Notification] Twilio Error:', error.message);
            throw new Error('Failed to send SMS');
        }
    },

    async sendVerificationCode(to, code) {
        return await this.sendSms({
            to,
            message: `Your Finance Tracker verification code is: ${code}`
        });
    }
};

module.exports = smsService;
