const smsService = {
    async sendSms({ to, message }) {
        console.log(`[Notification] Sending SMS to ${to}: ${message}`);
        // Placeholder for Twilio/SNS logic
        return { success: true, sid: `sms_${Date.now()}` };
    },

    async sendVerificationCode(to, code) {
        return await this.sendSms({
            to,
            message: `Your Finance Tracker verification code is: ${code}`
        });
    }
};

module.exports = smsService;
