const fs = require('fs');
const path = require('path');
const logger = require('../../../shared/utils/logger');
const schedulingService = require('../services/scheduling.service');
const reportGenerationService = require('../services/report-generation.service');
const db = require('../config/db');

const POLL_INTERVAL = 60 * 1000; // Poll every minute

class ReportWorker {
    constructor() {
        this.templatePath = path.join(__dirname, '../templates/monthly-report.html');
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info('[Reporting Worker] Started');
        this.poll();
    }

    async poll() {
        try {
            const dueSchedules = await schedulingService.getDueSchedules();
            if (dueSchedules.length > 0) {
                logger.info(`[Reporting Worker] Found ${dueSchedules.length} due reports`);
                for (const schedule of dueSchedules) {
                    await this.processSchedule(schedule);
                }
            }
        } catch (error) {
            logger.error('[Reporting Worker] Error during polling:', error);
        } finally {
            setTimeout(() => this.poll(), POLL_INTERVAL);
        }
    }

    async processSchedule(schedule) {
        const { id, user_id, email, frequency } = schedule;

        try {
            logger.info(`[Reporting Worker] Processing report for user ${user_id}`);

            // Calculate dates for the report (previous month for monthly, last 7 days for weekly)
            const endDate = new Date();
            const startDate = new Date();
            if (frequency === 'weekly') {
                startDate.setDate(endDate.getDate() - 7);
            } else if (frequency === 'daily') {
                startDate.setDate(endDate.getDate() - 1);
            } else {
                // Monthly
                startDate.setMonth(endDate.getMonth() - 1);
                startDate.setDate(1);
                endDate.setDate(0); // Last day of previous month
            }

            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const periodStr = `${startDate.toLocaleDateString('en-US', dateOptions)} - ${endDate.toLocaleDateString('en-US', dateOptions)}`;

            // 1. Fetch Data
            const summary = await reportGenerationService.generateSummary(user_id, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            const breakdown = await reportGenerationService.getCategoryBreakdown(user_id, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            const transactions = await reportGenerationService.getTransactions(user_id, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            // 2. Render Template
            const html = this.renderTemplate({
                title: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Financial Report`,
                period: periodStr,
                summary,
                breakdown,
                transactions: transactions.slice(0, 50) // Top 50
            });

            // 3. Queue Notification
            await this.queueNotification(user_id, email, html, frequency);

            // 4. Update Schedule
            await schedulingService.updateNextRun(id, frequency);

            logger.info(`[Reporting Worker] Successfully processed report for schedule ${id}`);
        } catch (error) {
            logger.error(`[Reporting Worker] Error processing schedule ${id}:`, error);
            // Optionally update schedule to retry later or mark as failed
        }
    }

    renderTemplate(data) {
        let template = fs.readFileSync(this.templatePath, 'utf8');

        const { title, period, summary, breakdown, transactions } = data;

        // Simple replacements
        template = template.replace('{{title}}', title);
        template = template.replace('{{period}}', period);
        template = template.replace('{{total_income}}', this.formatCurrency(summary.income || 0));
        template = template.replace('{{total_expenses}}', this.formatCurrency(summary.expenses || 0));
        template = template.replace('{{net_savings}}', this.formatCurrency((summary.income || 0) - (summary.expenses || 0)));

        // Categories HTML
        const categoriesHtml = breakdown.map(c => `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-color" style="background-color: ${c.color || '#6B7280'};"></div>
                    <span class="category-name">${c.name}</span>
                </div>
                <span class="category-amount">${this.formatCurrency(c.amount)}</span>
            </div>
        `).join('');
        template = template.replace('{{categories_html}}', categoriesHtml);

        // Transactions HTML
        const txnsHtml = transactions.map(t => `
            <tr>
                <td><span class="txn-date">${new Date(t.date).toLocaleDateString()}</span></td>
                <td><span class="txn-description">${t.description}</span></td>
                <td>${t.category || 'Uncategorized'}</td>
                <td class="txn-amount ${t.type === 'expense' ? 'negative' : 'positive'}">
                    ${t.type === 'expense' ? '-' : '+'}${this.formatCurrency(t.amount)}
                </td>
            </tr>
        `).join('');
        template = template.replace('{{transactions_html}}', txnsHtml);

        return template;
    }

    async queueNotification(userId, recipient, html, frequency) {
        const query = `
            INSERT INTO notification_queue (user_id, type, recipient, subject, content)
            VALUES ($1, $2, $3, $4, $5);
        `;
        const subject = `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Financial Report is Ready`;
        await db.query(query, [userId, 'email', recipient, subject, html]);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
}

module.exports = new ReportWorker();
