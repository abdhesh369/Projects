const logger = require('../../shared/utils/logger');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const budgetRoutes = require('./routes/budget.routes');

const app = express();
const PORT = process.env.PORT || 3006;

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

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'budget-service' });
});

// Routes
app.use('/', budgetRoutes);

app.listen(PORT, () => {
    logger.info(`Budget Service running on port ${PORT}`);
});
