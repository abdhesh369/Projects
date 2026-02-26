const jwt = require('jsonwebtoken');
const logger = require('../../../shared/utils/logger');

const authMiddleware = (req, res, next) => {
    // Check for token in headers or cookies
    let token = req.headers.authorization?.split(' ')[1];

    // Also check cookies (for frontend requests)
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
