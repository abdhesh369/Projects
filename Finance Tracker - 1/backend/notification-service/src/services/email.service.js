const emailService = {
    async sendEmail({ to, subject, template, data }) {
        console.log(`[Notification] Sending Email to ${to}: ${subject}`);
        // Placeholder for Nodemailer/SendGrid logic
        return { success: true, messageId: `msg_${Date.now()}` };
    },

    async sendWelcomeEmail(user) {
        return await this.sendEmail({
            to: user.email,
            subject: 'Welcome to Finance Tracker!',
            template: 'welcome',
            data: { name: user.firstName }
        });
    }
};

module.exports = emailService;
