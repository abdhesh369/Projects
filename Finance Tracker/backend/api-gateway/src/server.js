const logger = require('../../shared/utils/logger');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth.middleware');
const loggingMiddleware = require('./middleware/logging.middleware');
const validateRequest = require('./middleware/validation');
const csrfProtection = require('./middleware/csrf.middleware');
const axios = require('axios');

const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;
if (!INTERNAL_SERVICE_TOKEN) {
    logger.error('FATAL: INTERNAL_SERVICE_TOKEN is not set');
    process.exit(1);
}

// SECURITY: Hardening (Issues #12, #18, #5.7)
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:3011'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(loggingMiddleware);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Centralized Health Checks (Issue M-10)
app.get('/health/all', async (req, res) => {
    const services = {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        accounts: process.env.ACCOUNTS_SERVICE_URL || 'http://localhost:3002',
        analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003',
        audit: process.env.AUDIT_SERVICE_URL || 'http://localhost:3004',
        banking: process.env.BANKING_SERVICE_URL || 'http://localhost:3005',
        budget: process.env.BUDGET_SERVICE_URL || 'http://localhost:3006',
        notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3007',
        reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3008',
        transactions: process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3009',
        users: process.env.USERS_SERVICE_URL || 'http://localhost:3010'
    };

    const results = {};
    const checks = Object.entries(services).map(async ([name, url]) => {
        try {
            const start = Date.now();
            await axios.get(`${url}/health`, { timeout: 2000 });
            results[name] = { status: 'UP', latency: `${Date.now() - start}ms` };
        } catch (error) {
            results[name] = { status: 'DOWN', error: error.message };
        }
    });

    await Promise.all(checks);
    res.status(200).json({ gateway: 'UP', services: results });
});

// Auth Middleware (applied before proxies)
app.use(authMiddleware);
app.use(csrfProtection);
app.use(validateRequest);

// Service routes with Proxy
const createServiceProxy = (target) => createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/api\/[^\/]+/, '') || '/',
    onProxyReq: (proxyReq, req, res) => {
        // Add Internal Secret
        proxyReq.setHeader('X-Internal-Token', INTERNAL_SERVICE_TOKEN);

        // Pass through User Info if authenticated
        if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            if (req.user.email) proxyReq.setHeader('X-User-Email', req.user.email);
            if (req.user.role) proxyReq.setHeader('X-User-Role', req.user.role);
        }
    },
    onError: (err, req, res) => {
        logger.error('Proxy Error:', err);
        res.status(502).json({ error: 'Service Unavailable' });
    }
});

const rateLimit = require('./middleware/rateLimit.middleware');
const authRateLimit = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, please try again later.' }
});

// Apply proxies
app.use('/api/auth/login', authRateLimit, createServiceProxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001'));
app.use('/api/auth/register', authRateLimit, createServiceProxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001'));
app.use('/api/auth', rateLimit, createServiceProxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001'));
app.use('/api/accounts', rateLimit, createServiceProxy(process.env.ACCOUNTS_SERVICE_URL || 'http://localhost:3002'));
app.use('/api/users', rateLimit, createServiceProxy(process.env.USERS_SERVICE_URL || 'http://localhost:3010'));
app.use('/api/audit', rateLimit, createServiceProxy(process.env.AUDIT_SERVICE_URL || 'http://localhost:3004'));
app.use('/api/banking', rateLimit, createServiceProxy(process.env.BANKING_SERVICE_URL || 'http://localhost:3005'));
app.use('/api/budget', rateLimit, createServiceProxy(process.env.BUDGET_SERVICE_URL || 'http://localhost:3006'));
app.use('/api/goals', rateLimit, createProxyMiddleware({
    target: process.env.BUDGET_SERVICE_URL || 'http://localhost:3006',
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/api\/goals/, '/goals') || '/goals',
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('X-Internal-Token', process.env.INTERNAL_SERVICE_TOKEN);
        if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            if (req.user.email) proxyReq.setHeader('X-User-Email', req.user.email);
            if (req.user.role) proxyReq.setHeader('X-User-Role', req.user.role);
        }
    },
    onError: (err, req, res) => {
        logger.error('Proxy Error (Goals):', err);
        res.status(502).json({ error: 'Service Unavailable' });
    }
}));
app.use('/api/notifications', rateLimit, createServiceProxy(process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3007'));
app.use('/api/reporting', rateLimit, createServiceProxy(process.env.REPORTING_SERVICE_URL || 'http://localhost:3008'));
app.use('/api/transactions', rateLimit, createServiceProxy(process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3009'));
app.use('/api/analytics', rateLimit, createServiceProxy(process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Unhandled Error:', err);
    const status = err.status || 500;
    res.status(status).json({
        error: status === 500 ? 'Internal Server Error' : err.message,
        timestamp: new Date().toISOString()
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`API Gateway running on port ${PORT}`);
    });
}

module.exports = app;
