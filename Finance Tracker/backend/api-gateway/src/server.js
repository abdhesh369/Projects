const logger = require('../../shared/utils/logger');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth.middleware');
const validateRequest = require('./middleware/validation');

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
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3011', // default to frontend
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Auth Middleware (applied before proxies)
app.use(authMiddleware);
app.use(validateRequest);

// Service routes with Proxy
const createServiceProxy = (target) => createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/api\/[^\/]+/, '') || '/', // Fix Issue #8: Ensure at least '/' is returned
    onProxyReq: (proxyReq, req, res) => {
        // Add Internal Secret
        proxyReq.setHeader('X-Internal-Token', INTERNAL_SERVICE_TOKEN);

        // Pass through User Info if authenticated
        if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            if (req.user.email) proxyReq.setHeader('X-User-Email', req.user.email);
            if (req.user.role) proxyReq.setHeader('X-User-Role', req.user.role);
        }
        logger.info(`[Proxy] ${req.method} ${req.url} -> ${target}`);
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
app.use('/api/notifications', rateLimit, createServiceProxy(process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3007'));
app.use('/api/reporting', rateLimit, createServiceProxy(process.env.REPORTING_SERVICE_URL || 'http://localhost:3008'));
app.use('/api/transactions', rateLimit, createServiceProxy(process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3009'));
app.use('/api/analytics', rateLimit, createServiceProxy(process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003'));
app.use('/api/billing', rateLimit, createServiceProxy(process.env.USERS_SERVICE_URL || 'http://localhost:3010'));

app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
});
