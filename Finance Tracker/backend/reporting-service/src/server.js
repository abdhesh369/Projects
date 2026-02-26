const logger = require('../../shared/utils/logger');
require('dotenv').config();
const reportWorker = require('./workers/report.worker');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3008;

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    logger.error('FATAL: INTERNAL_SERVICE_TOKEN not configured');
    process.exit(1);
}

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));

const reportRoutes = require('./routes/report.routes');

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'reporting-service' });
});

app.use('/', reportRoutes);

app.listen(PORT, () => {
    logger.info(`Reporting Service running on port ${PORT}`);
    reportWorker.start();
});
