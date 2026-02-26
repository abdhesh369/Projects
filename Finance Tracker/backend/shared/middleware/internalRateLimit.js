const rateLimit = require('express-rate-limit');

/**
 * Internal Rate Limiter
 * Provides two levels of protection:
 * 1. High limit for requests with a valid X-Internal-Token
 * 2. Standard limit for all other requests
 */
const internalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: (req) => {
        const internalToken = req.headers['x-internal-token'];
        // If internal token is valid, allow 1000 requests per minute
        if (internalToken === process.env.INTERNAL_SERVICE_TOKEN) {
            return 1000;
        }
        // Otherwise, standard limit of 100 requests per minute
        return 100;
    },
    message: {
        error: 'Too many requests'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = internalLimiter;
