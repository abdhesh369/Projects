const logger = require('../../../shared/utils/logger');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Public routes that don't need authentication
    const publicPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/health',
        '/health'
    ];

    if (publicPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken; // Issue #16
    }

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        logger.error('FATAL: JWT_SECRET not configured in API Gateway');
        return res.status(500).json({ error: 'Internal server configuration error' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        // Add user info to headers for downstream services
        req.headers['x-user-id'] = decoded.id;
        req.headers['x-user-email'] = decoded.email;

        next();
    } catch (error) {
        logger.error('API Gateway Auth Error:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
