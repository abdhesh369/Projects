const logger = require('./logger');

/**
 * Shared utility for request validation
 * @param {Object} schema - Validation schema { field: { type, required, min, max } }
 * @returns {Function} - Express middleware
 */
const validate = (schema) => (req, res, next) => {
    const data = req.method === 'GET' ? req.query : req.body;
    const errors = [];

    Object.keys(schema).forEach(field => {
        const rules = schema[field];
        const value = data[field];

        // Check required
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
            return;
        }

        if (value !== undefined && value !== null && value !== '') {
            // Check type
            if (rules.type === 'number') {
                if (isNaN(Number(value))) {
                    errors.push(`${field} must be a number`);
                } else {
                    const numValue = Number(value);
                    if (rules.min !== undefined && numValue < rules.min) {
                        errors.push(`${field} must be at least ${rules.min}`);
                    }
                    if (rules.max !== undefined && numValue > rules.max) {
                        errors.push(`${field} must be at most ${rules.max}`);
                    }
                }
            } else if (rules.type === 'string') {
                if (typeof value !== 'string') {
                    errors.push(`${field} must be a string`);
                } else {
                    if (rules.minLength !== undefined && value.length < rules.minLength) {
                        errors.push(`${field} must be at least ${rules.minLength} characters`);
                    }
                    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                        errors.push(`${field} must be at most ${rules.maxLength} characters`);
                    }
                    if (rules.regex && !rules.regex.test(value)) {
                        errors.push(`${field} is invalid format`);
                    }
                }
            } else if (rules.type === 'date') {
                if (isNaN(Date.parse(value))) {
                    errors.push(`${field} must be a valid date`);
                }
            }
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
};

module.exports = {
    validate
};
