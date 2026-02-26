const logger = require('../../../shared/utils/logger');
const db = require('../config/db');

/**
 * Scheduling Service
 * Manages recurring report delivery schedules
 */
const schedulingService = {
    /**
     * Schedules a report for a user
     * @param {string} userId
     * @param {Object} scheduleData
     * @returns {Object} saved schedule
     */
    async scheduleReport(userId, scheduleData) {
        try {
            const { frequency, format, email } = scheduleData;
            const nextRunAt = this._calculateNextRun(frequency);

            const query = `
                INSERT INTO report_schedules (user_id, frequency, format, email, next_run_at)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, user_id, frequency, format, email, status, next_run_at, created_at;
            `;
            const values = [userId, frequency || 'monthly', format || 'pdf', email, nextRunAt];

            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            logger.error('Report scheduling error:', error);
            throw error;
        }
    },

    /**
     * Get all active schedules that are due for processing
     */
    async getDueSchedules() {
        try {
            const query = `
                SELECT * FROM report_schedules 
                WHERE status = 'active' AND (next_run_at IS NULL OR next_run_at <= NOW())
                LIMIT 50;
            `;
            const { rows } = await db.query(query);
            return rows;
        } catch (error) {
            logger.error('Error fetching due schedules:', error);
            throw error;
        }
    },

    /**
     * Update the next run time after a successful report generation
     */
    async updateNextRun(scheduleId, frequency) {
        try {
            const nextRunAt = this._calculateNextRun(frequency);
            const query = `
                UPDATE report_schedules 
                SET last_run_at = NOW(), next_run_at = $1, updated_at = NOW()
                WHERE id = $2;
            `;
            await db.query(query, [nextRunAt, scheduleId]);
        } catch (error) {
            logger.error(`Error updating next run for schedule ${scheduleId}:`, error);
        }
    },

    _calculateNextRun(frequency) {
        const now = new Date();
        if (frequency === 'weekly') {
            now.setDate(now.getDate() + 7);
        } else if (frequency === 'daily') {
            now.setDate(now.getDate() + 1);
        } else {
            // Default to monthly: 1st of next month
            now.setMonth(now.getMonth() + 1);
            now.setDate(1);
            now.setHours(0, 0, 0, 0);
        }
        return now.toISOString();
    }
};

module.exports = schedulingService;
