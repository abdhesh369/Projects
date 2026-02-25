const Joi = require('joi');

const schemas = {
    'POST:/api/auth/login': Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),
    'POST:/api/auth/register': Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required()
    }),
    'POST:/api/auth/refresh': Joi.object({
        refreshToken: Joi.string().required()
    }),
    'POST:/api/auth/mfa/verify': Joi.object({
        code: Joi.string().length(6).required()
    }),
    'POST:/api/auth/logout': Joi.object({
        refreshToken: Joi.string().allow('', null)
    }),
    'POST:/api/banking/link-token/exchange': Joi.object({
        publicToken: Joi.string().required(),
        metadata: Joi.object().optional()
    }),
    'POST:/api/audit/logs': Joi.object({
        action: Joi.string().required(),
        entityType: Joi.string().required(),
        entityId: Joi.string().required(),
        previousState: Joi.object().allow(null),
        newState: Joi.object().allow(null)
    }),
    'POST:/api/transactions': Joi.object({
        accountId: Joi.number().required(),
        categoryId: Joi.number().required(),
        amount: Joi.number().positive().required(),
        type: Joi.string().valid('income', 'expense').required(),
        date: Joi.date().iso().required(),
        description: Joi.string().max(255).allow('', null),
        notes: Joi.string().allow('', null),
        isRecurring: Joi.boolean().default(false)
    }),
    // Fix Issue #16: Add PUT validation for transactions
    'PUT:/api/transactions/:id': Joi.object({
        accountId: Joi.number().optional(),
        categoryId: Joi.number().optional(),
        amount: Joi.number().positive().optional(),
        type: Joi.string().valid('income', 'expense').optional(),
        date: Joi.date().iso().optional(),
        description: Joi.string().max(255).allow('', null),
        notes: Joi.string().allow('', null),
        isRecurring: Joi.boolean().optional()
    }),
    'POST:/api/accounts': Joi.object({
        name: Joi.string().min(2).required(),
        type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'other').required(),
        balance: Joi.number().required(),
        currency: Joi.string().length(3).uppercase().default('USD'),
        institution: Joi.string().allow('', null)
    }),
    'PUT:/api/accounts/:id': Joi.object({
        name: Joi.string().min(2).optional(),
        type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'other').optional(),
        balance: Joi.number().optional(),
        currency: Joi.string().length(3).uppercase().optional(),
        institution: Joi.string().allow('', null).optional(),
        color: Joi.string().optional(),
        icon: Joi.string().optional()
    }),
    'POST:/api/budget': Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().required(),
        categoryId: Joi.number().required(),
        period: Joi.string().valid('monthly', 'weekly', 'yearly').default('monthly')
    }),
    'GET:/api/analytics': Joi.object({
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required()
    }),
    'GET:/api/reporting': Joi.object({
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required()
    })
};

const validateRequest = (req, res, next) => {
    const method = req.method;
    let fullPath = `${req.baseUrl}${req.path}`.replace(/\/$/, '');

    // Simple dynamic segment matching: replace UUID-like or Numeric segments with ':id'
    // Matches /api/transactions/123 to /api/transactions/:id
    const sanitizedPath = fullPath.replace(/\/\d+/g, '/:id').replace(/\/[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/gi, '/:id');

    const schemaKey = `${method}:${sanitizedPath}`;
    const schema = schemas[schemaKey] || schemas[`${method}:${req.baseUrl}`];

    if (schema) {
        const data = method === 'GET' ? req.query : req.body;
        const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.details.map(d => d.message)
            });
        }

        // Replace req.body/query with validated and stripped values
        if (method === 'GET') req.query = value;
        else req.body = value;
    }

    next();
};

module.exports = validateRequest;
