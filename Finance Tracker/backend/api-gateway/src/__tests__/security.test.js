process.env.JWT_SECRET = 'test-secret';
process.env.INTERNAL_SERVICE_TOKEN = 'test-internal-token';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('API Gateway Security', () => {
    describe('CSRF Protection', () => {
        it('should block POST requests without CSRF headers', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            // Since it's a public route in authMiddleware, we need to check if CSRF middleware is applied correctly.
            // Wait, CSRF middleware is applied AFTER authMiddleware in server.js.
            // app.use(authMiddleware);
            // app.use(csrfProtection);

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('X-Requested-With');
        });

        it('should allow POST requests with X-Requested-With header', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('X-Requested-With', 'XMLHttpRequest')
                .send({ email: 'test@example.com', password: 'password123' });

            // It should pass CSRF and reach validation or proxy
            // Since proxy targets are likely down, it might return 502 or something else, but not 403 CSRF error
            expect(response.status).not.toBe(403);
        });
    });

    describe('Request Validation', () => {
        it('should reject malformed register request', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .set('X-Requested-With', 'XMLHttpRequest')
                .send({ email: 'invalid-email' }); // Missing fields and invalid email

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });
});
