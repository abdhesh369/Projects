const logger = require('../../../shared/utils/logger');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

/**
 * Export Service
 * Formats data into CSV or PDF formats
 */
const exportService = {
    /**
     * @param {Array} transactions 
     * @param {Object} res Response object
     */
    generateCSV(transactions, res) {
        const fields = ['id', 'amount', 'type', 'category', 'date', 'description'];
        const opts = { fields };

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(transactions);
            res.header('Content-Type', 'text/csv');
            res.attachment('transactions.csv');
            res.send(csv);
        } catch (err) {
            logger.error('CSV Generation Error:', err);
            res.status(500).json({ error: 'Failed to generate CSV' });
        }
    },

    /**
     * @param {Array} transactions 
     * @param {Object} res Response object
     */
    generatePDF(transactions, res) {
        try {
            const doc = new PDFDocument({ margin: 50 });

            res.header('Content-Type', 'application/pdf');
            res.attachment('transactions.pdf');

            doc.pipe(res);
            doc.fontSize(20).text('Transaction Report', { align: 'center' });
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            // Table Header
            doc.fontSize(12).text('Date', 50, doc.y, { width: 100, continued: true });
            doc.text('Description', { width: 250, continued: true });
            doc.text('Amount', { width: 100, align: 'right' });
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            transactions.forEach((t) => {
                // Check if we need a new page (approx 750 is bottom for default margin)
                if (doc.y > 700) {
                    doc.addPage();
                    doc.fontSize(12).text('Date', 50, 50, { width: 100, continued: true });
                    doc.text('Description', { width: 250, continued: true });
                    doc.text('Amount', { width: 100, align: 'right' });
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                    doc.moveDown(0.5);
                }

                const dateStr = t.date ? new Date(t.date).toISOString().split('T')[0] : 'N/A';
                const description = t.description || 'No description';
                const amountStr = `$${t.amount || 0}`;

                const currentY = doc.y;
                doc.fontSize(10).text(dateStr, 50, currentY, { width: 100 });
                doc.text(description, 150, currentY, { width: 250 });
                doc.text(amountStr, 400, currentY, { width: 100, align: 'right' });

                doc.moveDown(0.5);
            });

            doc.end();
        } catch (err) {
            logger.error('PDF Generation Error:', err);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    }
};

module.exports = exportService;
