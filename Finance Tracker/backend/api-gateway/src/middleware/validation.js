const Joi = require('joi');

const schemas = {
    '/api/auth/login': Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),
    '/api/auth/register': Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required()
    }),
    '/api/auth/refresh': Joi.object({
        refreshToken: Joi.string().required()
    }),
    '/api/auth/mfa/verify': Joi.object({
        code: Joi.string().length(6).required(),
        secret: Joi.string().required()
    }),
    '/api/auth/logout': Joi.object({
        refreshToken: Joi.string().allow('', null)
    }),
    '/api/banking/link-token/exchange': Joi.object({
        publicToken: Joi.string().required(),
        metadata: Joi.object().optional()
    }),
    '/api/audit/logs': Joi.object({
        action: Joi.string().required(),
        entityType: Joi.string().required(),
        entityId: Joi.string().required(),
        previousState: Joi.object().allow(null),
        newState: Joi.object().allow(null)
    }),
    '/api/audit/purge': Joi.object({
        days: Joi.number().integer().min(1).default(90)
    }),
    '/api/transactions': Joi.object({
        amount: Joi.number().positive().required(),
        type: Joi.string().valid('income', 'expense').required(),
        category: Joi.string().required(),
        date: Joi.date().iso().required(),
        description: Joi.string().max(255).allow('', null)
    }),
    '/api/accounts': Joi.object({
        name: Joi.string().min(2).required(),
        type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'other').required(),
        balance: Joi.number().required(),
        currency: Joi.string().length(3).uppercase().default('USD'),
        institution: Joi.string().allow('', null)
    }),
    '/api/budget': Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().required(),
        category: Joi.string().required(),
        period: Joi.string().valid('monthly', 'weekly', 'yearly').default('monthly')
    }),
    '/api/users/profile': Joi.object({
        name: Joi.string().min(2),
        preferences: Joi.object()
    }),
    '/api/analytics': Joi.object({
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required()
    }),
    '/api/reporting': Joi.object({
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required()
    })
};

const validateRequest = (req, res, next) => {
    const path = req.baseUrl; // Matches /api/auth, /api/transactions etc.
    const fullPath = `${req.baseUrl}${req.path}`.replace(/\/$/, '');

    const schema = schemas[fullPath] || schemas[path];

    if (schema) {
        const data = req.method === 'GET' ? req.query : req.body;
        const { error } = schema.validate(data, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.details.map(d => d.message)
            });
        }
    }

    next();
};

module.exports = validateRequest;
