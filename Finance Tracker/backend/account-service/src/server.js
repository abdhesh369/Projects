const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3002;

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
    res.status(200).json({ status: 'UP', service: 'account-service' });
});

// Routes
const accountRoutes = require('./routes/account.routes');
app.use('/', accountRoutes);

app.listen(PORT, () => {
    console.log(`Account Service running on port ${PORT}`);
});
