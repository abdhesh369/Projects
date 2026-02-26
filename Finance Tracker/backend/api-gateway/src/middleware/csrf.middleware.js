const logger = require('../../../shared/utils/logger');

/**
 * Simple CSRF protection for SPAs.
 * Enforces that all state-changing requests (POST, PUT, DELETE, PATCH)
 * must have a custom header that browsers don't automatically add.
 */
const csrfProtection = (req, res, next) => {
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    if (stateChangingMethods.includes(req.method)) {
        // We look for X-Requested-With or X-CSRF-Token
        // Browsers cannot set these headers in a cross-site request (CSRF) 
        // without a preflight CORS check, which would fail if the origin isn't allowed.
        const csrfHeader = req.get('X-Requested-With') || req.get('X-CSRF-Token');

        if (!csrfHeader) {
            logger.warn(`Potential CSRF attempt blocked: ${req.method} ${req.url} from ${req.ip}`);
            return res.status(403).json({
                error: 'Security Check Failed',
                message: 'Custom X-Requested-With or X-CSRF-Token header is required for state-changing requests.'
            });
        }
    }

    next();
};

module.exports = csrfProtection;
