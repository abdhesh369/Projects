const logger = require('../../shared/utils/logger');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const internalLimiter = require('../../shared/middleware/internalRateLimit');

const app = express();
const PORT = process.env.PORT || 3001;

// Startup validation
if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET not configured');
  process.exit(1);
}
if (!process.env.INTERNAL_SERVICE_TOKEN) {
  logger.error('FATAL: INTERNAL_SERVICE_TOKEN not configured');
  process.exit(1);
}

// SECURITY: Hardening
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3011',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Internal Rate Limiting (Issue M-07)
app.use(internalLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service' });
});

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Auth Service running on port ${PORT}`);
  });
}

module.exports = app;
