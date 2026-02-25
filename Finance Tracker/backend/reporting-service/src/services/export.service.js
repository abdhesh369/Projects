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
            console.error('CSV Generation Error:', err);
            res.status(500).json({ error: 'Failed to generate CSV' });
        }
    },

    /**
     * @param {Array} transactions 
     * @param {Object} res Response object
     */
    generatePDF(transactions, res) {
        try {
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
        } catch (err) {
            console.error('PDF Generation Error:', err);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    }
};

module.exports = exportService;
