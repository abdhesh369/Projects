process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-test';
process.env.REFRESH_SECRET = 'test-refresh-key-that-is-long-enough-for-test';

const jwtService = require('./jwt.service');
const jwt = require('jsonwebtoken');

describe('JWT Service', () => {
    it('should generate a token with id, email, and role', () => {
        const user = { id: 1, email: 'test@example.com', role: 'admin' };

        // Ensure generateToken expects an object with email and role
        // In jwt.service.js, generateToken now takes the whole user object or an object like { id, email, role }
        // We will pass the user directly. Note: in jwt.service.js generateToken assumes user is passed directly or as a payload object
        // The implementation in jwt.service.js:
        // generateToken(user) {
        //     return jwt.sign(
        //         { id: user.id, email: user.email, role: user.role },
        //         ACCESS_SECRET,
        //         ...

        const token = jwtService.generateToken(user);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded).toMatchObject({
            id: 1,
            email: 'test@example.com',
            role: 'admin'
        });
        expect(decoded.exp).toBeDefined();
    });
});
