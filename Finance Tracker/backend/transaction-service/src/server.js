const logger = require('../../shared/utils/logger');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const transactionRoutes = require('./routes/transaction.routes');
const internalLimiter = require('../../shared/middleware/internalRateLimit');

const app = express();
const PORT = process.env.PORT || 3009;

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

// Internal Rate Limiting (Issue M-07)
app.use(internalLimiter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'transaction-service' });
});

// Routes
app.use('/', transactionRoutes);

// Workers
const recurringWorker = require('./workers/recurring.worker');
recurringWorker.start();

app.listen(PORT, () => {
    logger.info(`Transaction Service running on port ${PORT}`);
});
