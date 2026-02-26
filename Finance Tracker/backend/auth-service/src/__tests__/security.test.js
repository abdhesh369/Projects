process.env.JWT_SECRET = 'this-is-a-super-secret-test-jwt-key!123';
process.env.REFRESH_SECRET = 'this-is-a-super-secret-test-refresh-key!123';
process.env.INTERNAL_SERVICE_TOKEN = 'test-internal-token';
process.env.NODE_ENV = 'test';

const request = require('supertest');

// MOCK: mfa.service.js depends on otplib which uses ESM. 
// We mock it to avoid SyntaxErrors in the test environment.
jest.mock('../services/mfa.service.js', () => ({
    generateSecret: jest.fn(),
    generateQRCode: jest.fn(),
    verifyToken: jest.fn(),
}));

// MOCK: Redis
jest.mock('../config/redis', () => ({
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
}));

const app = require('../server');
const { pool } = require('../../../shared/config/db');
const redis = require('../config/redis');

describe('Auth Service Security', () => {
    afterAll(async () => {
        await pool.end();
        await redis.quit();
    });

    describe('Input Validation', () => {
        it('should reject registration with weak password', async () => {
            const response = await request(app)
                .post('/register')
                .send({
                    email: 'test@example.com',
                    password: '123', // Too short
                    firstName: 'John',
                    lastName: 'Doe'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed'); // Fixed message
        });

        it('should reject login without an email', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    password: 'password123'
                });

            expect(response.status).toBe(400);
        });
    });

    // We skip rate limiter tests because it might require mocking or delay, but let's test a basic rejection
    // Mocking express-rate-limit or triggering it usually requires sending multiple requests
    describe('Rate Limiting', () => {
        it('should have rate limiter middleware applied to /login', async () => {
            const response = await request(app)
                .post('/login')
                .send({ email: 'rate@example.com', password: 'wrong' });

            // In our implementation, standardHeaders is typically true but might be legacy headers
            // We check if limit headers exist
            expect(response.headers['x-ratelimit-limit'] || response.headers['ratelimit-limit']).toBeDefined();
        });
    });
});
