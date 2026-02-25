const logger = require('../../../shared/utils/logger');
const reportGenerationService = require('../services/report-generation.service');
const exportService = require('../services/export.service');
const schedulingService = require('../services/scheduling.service');

const reportController = {
    async getSummaryReport(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'startDate and endDate are required' });
            }

            const summary = await reportGenerationService.generateSummary(userId, { startDate, endDate });
            const categories = await reportGenerationService.getCategoryBreakdown(userId, { startDate, endDate });

            res.status(200).json({
                summary,
                categories,
                period: { startDate, endDate }
            });
        } catch (error) {
            logger.error('[Reporting] Report generation error:', error);
            res.status(500).json({ error: 'Failed to generate report' });
        }
    },

    async getExport(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate, format } = req.query;

            const transactions = await reportGenerationService.getTransactions(userId, { startDate, endDate });

            if (format === 'csv') {
                return exportService.generateCSV(transactions, res);
            } else if (format === 'pdf') {
                return exportService.generatePDF(transactions, res);
            } else {
                return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
            }
        } catch (error) {
            logger.error('[Reporting] Export generation error:', error);
            res.status(500).json({ error: 'Failed to export report' });
        }
    },

    async scheduleReport(req, res) {
        try {
            const userId = req.user.id;
            const schedule = await schedulingService.scheduleReport(userId, req.body);
            res.status(201).json(schedule);
        } catch (error) {
            logger.error('[Reporting] Schedule report error:', error);
            res.status(500).json({ error: 'Failed to schedule report' });
        }
    }
};

module.exports = reportController;
