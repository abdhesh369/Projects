const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    console.error('FATAL: JWT secrets (JWT_SECRET, REFRESH_SECRET) are not configured.');
    process.exit(1);
}

const jwtService = {
    generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            ACCESS_SECRET,
            { expiresIn: '15m' }
        );
    },

    generateRefreshToken(user) {
        return jwt.sign(
            { id: user.id },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );
    },

    verifyToken(token) {
        try {
            return jwt.verify(token, ACCESS_SECRET);
        } catch (error) {
            return null;
        }
    },

    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, REFRESH_SECRET);
        } catch (error) {
            return null;
        }
    }
};

module.exports = jwtService;
