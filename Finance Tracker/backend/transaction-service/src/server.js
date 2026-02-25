require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();
const PORT = process.env.PORT || 3009;

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    console.error('FATAL: INTERNAL_SERVICE_TOKEN not configured');
    process.exit(1);
}

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'transaction-service' });
});

// Routes
app.use('/', transactionRoutes);

// Workers
const recurringWorker = require('./workers/recurring.worker');
recurringWorker.start();

app.listen(PORT, () => {
    console.log(`Transaction Service running on port ${PORT}`);
});
