const logger = require('../../../shared/utils/logger');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configure transporter
// In production, use SendGrid, SES, or another provider.
// For development, use Ethereal or a local SMTP.
const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        console.warn('[Email] SMTP_USER/SMTP_PASS not set. Using console-only mode.');
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
};

let transporter = null;

/**
 * Load an HTML template and replace variables.
 */
const loadTemplate = (templateName, data = {}) => {
    try {
        const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
        let html = fs.readFileSync(templatePath, 'utf-8');

        // Replace {{variable}} placeholders
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, value);
        });

        return html;
    } catch (error) {
        console.warn(`[Email] Template "${templateName}" not found, using plain text.`);
        return null;
    }
};

const emailService = {
    async sendEmail({ to, subject, template, data, text }) {
        logger.info(`[Email] Sending to ${to}: ${subject}`);

        // Load HTML template if specified
        const html = template ? loadTemplate(template, data) : null;

        if (!transporter) {
            transporter = createTransporter();
        }

        if (!transporter) {
            // Console-only fallback for development
            logger.info(`[Email] (MOCK) To: ${to}, Subject: ${subject}`);
            logger.info(`[Email] (MOCK) Body: ${text || html || 'No content'}`);
            return { success: true, messageId: `mock_${Date.now()}`, mock: true };
        }

        try {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Finance Tracker" <noreply@financetracker.app>',
                to,
                subject,
                text: text || subject,
                html: html || undefined,
            });

            logger.info(`[Email] Sent successfully. MessageId: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('[Email] Send failed:', error.message);
            throw error;
        }
    },

    async sendWelcomeEmail(user) {
        return await this.sendEmail({
            to: user.email,
            subject: 'Welcome to Finance Tracker!',
            template: 'welcome',
            data: { name: user.firstName || user.email }
        });
    },

    async sendBudgetAlert(user, budget) {
        return await this.sendEmail({
            to: user.email,
            subject: `Budget Alert: ${budget.category} spending approaching limit`,
            template: 'budget-alert',
            data: {
                name: user.firstName || user.email,
                category: budget.category,
                spent: budget.spent,
                limit: budget.limit,
                percentage: Math.round((budget.spent / budget.limit) * 100),
            }
        });
    },

    async sendTransactionAlert(user, transaction) {
        return await this.sendEmail({
            to: user.email,
            subject: `Transaction Alert: ${transaction.name} - $${transaction.amount}`,
            template: 'transaction-alert',
            data: {
                name: user.firstName || user.email,
                transactionName: transaction.name,
                amount: transaction.amount,
                category: transaction.category,
                date: transaction.date,
            }
        });
    }
};

module.exports = emailService;
