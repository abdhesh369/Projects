const logger = require('../../shared/utils/logger');

/**
 * Logging middleware for API Gateway
 * Logs incoming requests with method, url, and basic performance timing
 */
const loggingMiddleware = (req, res, next) => {
    const start = Date.now();

    // Log request start
    logger.info(`--> ${req.method} ${req.originalUrl} [User: ${req.user ? req.user.id : 'Anonymous'}]`);

    // Capture response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const level = statusCode >= 400 ? 'warn' : 'info';

        logger[level](`<-- ${req.method} ${req.originalUrl} ${statusCode} (${duration}ms)`);
    });

    next();
};

module.exports = loggingMiddleware;
