const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3010;

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

const userRoutes = require('./routes/user.routes');
const billingRoutes = require('./routes/billing.routes');

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'user-service' });
});

app.use('/', userRoutes);
app.use('/billing', billingRoutes);

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
