const reportGenerationService = require('../services/report-generation.service');

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
            console.error('[Reporting] Report generation error:', error);
            res.status(500).json({ error: 'Failed to generate report' });
        }
    },

    async getExport(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate, format } = req.query;

            const transactions = await reportGenerationService.getTransactions(userId, { startDate, endDate });

            if (format === 'csv') {
                const { Parser } = require('json2csv');
                const fields = ['id', 'amount', 'type', 'category', 'date', 'description'];
                const opts = { fields };

                try {
                    const parser = new Parser(opts);
                    const csv = parser.parse(transactions);
                    res.header('Content-Type', 'text/csv');
                    res.attachment('transactions.csv');
                    return res.send(csv);
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to generated CSV' });
                }
            } else if (format === 'pdf') {
                const PDFDocument = require('pdfkit');
                const doc = new PDFDocument();

                res.header('Content-Type', 'application/pdf');
                res.attachment('transactions.pdf');

                doc.pipe(res);
                doc.fontSize(20).text('Transaction Report', { align: 'center' });
                doc.moveDown();

                transactions.forEach(t => {
                    doc.fontSize(12).text(`${new Date(t.date).toISOString().split('T')[0]} - ${t.description}`);
                    doc.fontSize(10).text(`Amount: $${t.amount} | Type: ${t.type} | Category: ${t.categoryId || t.category || 'N/A'}`);
                    doc.moveDown(0.5);
                });

                doc.end();
            } else {
                return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
            }
        } catch (error) {
            console.error('[Reporting] Export generation error:', error);
            res.status(500).json({ error: 'Failed to export report' });
        }
    }
};

module.exports = reportController;
