const logger = require('../../../shared/utils/logger');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const internalToken = req.headers['x-internal-token'];
    const gatewayUserId = req.headers['x-user-id'];
    const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_TOKEN;

    if (!INTERNAL_SECRET) {
        logger.error('FATAL: INTERNAL_SERVICE_TOKEN not configured in service');
        return res.status(500).json({ error: 'Internal server configuration error' });
    }

    if (internalToken && internalToken === INTERNAL_SECRET && gatewayUserId) {
        req.user = {
            id: gatewayUserId,
            email: req.headers['x-user-email'],
            role: req.headers['x-user-role']
        };
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
