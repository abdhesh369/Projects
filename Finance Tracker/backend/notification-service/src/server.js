const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3007;

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
    res.status(200).json({ status: 'UP', service: 'notification-service' });
});

// Routes
const notificationRoutes = require('./routes/notification.routes');
app.use('/', notificationRoutes);

app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});
