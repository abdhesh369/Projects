const logger = require('../../shared/utils/logger');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const realtimeService = require('./services/realtime.service');

const app = express();
const PORT = process.env.PORT || 3007;

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
    res.status(200).json({ status: 'UP', service: 'notification-service' });
});

// Routes
const notificationRoutes = require('./routes/notification.routes');
app.use('/', notificationRoutes);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
realtimeService.init(server);

server.listen(PORT, () => {
    logger.info(`Notification Service running on port ${PORT} (with WebSocket support)`);
});
