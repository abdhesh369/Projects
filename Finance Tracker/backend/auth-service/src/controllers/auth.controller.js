const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
const Session = require('../models/session.model');
const authenticationService = require('../services/authentication.service');
const jwtService = require('../services/jwt.service');
const mfaService = require('../services/mfa.service');

// Ensure sessions table exists on startup
Session.ensureTable().catch(err => console.error('Failed to create sessions table:', err.message));

const authController = {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName } = req.body;

            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const passwordHash = await authenticationService.hashPassword(password);
            const user = await User.create({ email, passwordHash, firstName, lastName });

            const token = jwtService.generateToken({ id: user.id });
            const refreshToken = jwtService.generateRefreshToken({ id: user.id });

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await RefreshToken.create(user.id, refreshToken, expiresAt);

            // Track session
            const deviceInfo = req.headers['user-agent'] || 'Unknown';
            const ipAddress = req.ip || req.connection.remoteAddress;
            await Session.create(user.id, token, deviceInfo, ipAddress);

            res.status(201).json({ user, token, refreshToken });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Failed to register user' });
        }
    },

    async login(req, res) {
        try {
            const { email, password, mfaCode } = req.body;

            const user = await authenticationService.validateUser(email, password);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // If MFA is enabled, require MFA code
            if (user.mfa_enabled) {
                if (!mfaCode) {
                    return res.status(200).json({
                        mfaRequired: true,
                        message: 'MFA code required'
                    });
                }
                const isValid = await mfaService.verifyCode(user.id, mfaCode, user.mfa_secret);
                if (!isValid) {
                    return res.status(401).json({ error: 'Invalid MFA code' });
                }
            }

            const token = jwtService.generateToken({ id: user.id });
            const refreshToken = jwtService.generateRefreshToken({ id: user.id });

            await RefreshToken.deleteByUserId(user.id);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await RefreshToken.create(user.id, refreshToken, expiresAt);

            // Track session
            const deviceInfo = req.headers['user-agent'] || 'Unknown';
            const ipAddress = req.ip || req.connection.remoteAddress;
            await Session.create(user.id, token, deviceInfo, ipAddress);

            delete user.password_hash;

            res.status(200).json({ user, token, refreshToken });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Failed to login' });
        }
    },

    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

            const payload = jwtService.verifyRefreshToken(refreshToken);
            if (!payload) return res.status(401).json({ error: 'Invalid refresh token' });

            const storedToken = await RefreshToken.findByToken(refreshToken);
            if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
                if (storedToken) await RefreshToken.deleteByToken(refreshToken);
                return res.status(401).json({ error: 'Refresh token expired or not found' });
            }

            const token = jwtService.generateToken({ id: payload.id });

            // Track the new session
            const deviceInfo = req.headers['user-agent'] || 'Unknown';
            const ipAddress = req.ip || req.connection.remoteAddress;
            await Session.create(payload.id, token, deviceInfo, ipAddress);

            res.status(200).json({ token });
        } catch (error) {
            console.error('Refresh error:', error);
            res.status(500).json({ error: 'Failed to refresh token' });
        }
    },

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await RefreshToken.deleteByToken(refreshToken);
            }

            // Remove session for the current token
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                if (token) await Session.deleteByToken(token);
            }

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Failed to logout' });
        }
    },

    async logoutAll(req, res) {
        try {
            const userId = req.user.id;

            // Delete all refresh tokens
            await RefreshToken.deleteByUserId(userId);

            // Delete all sessions except the current one
            const authHeader = req.headers.authorization;
            const currentToken = authHeader ? authHeader.split(' ')[1] : null;

            let removedCount;
            if (currentToken) {
                removedCount = await Session.deleteOthersByUserId(userId, currentToken);
            } else {
                removedCount = await Session.deleteAllByUserId(userId);
            }

            res.status(200).json({
                message: `Logged out of ${removedCount} other device(s) successfully`
            });
        } catch (error) {
            console.error('LogoutAll error:', error);
            res.status(500).json({ error: 'Failed to logout all devices' });
        }
    },

    async getSessions(req, res) {
        try {
            const userId = req.user.id;
            const sessions = await Session.findByUserId(userId);
            res.status(200).json({ sessions });
        } catch (error) {
            console.error('GetSessions error:', error);
            res.status(500).json({ error: 'Failed to fetch sessions' });
        }
    },

    async setupMFA(req, res) {
        try {
            const userId = req.user.id;
            const mfaDetails = await mfaService.generateSecret(userId);
            res.status(200).json(mfaDetails);
        } catch (error) {
            console.error('MFA Setup error:', error);
            res.status(500).json({ error: 'Failed to setup MFA' });
        }
    },

    async verifyMFA(req, res) {
        try {
            const userId = req.user.id;
            const { code, secret } = req.body;

            const isValid = await mfaService.verifyCode(userId, code, secret);
            if (!isValid) {
                return res.status(400).json({ error: 'Invalid MFA code' });
            }

            await User.update(userId, { mfa_enabled: true, mfa_secret: secret });
            res.status(200).json({ message: 'MFA verified and enabled successfully' });
        } catch (error) {
            console.error('MFA Verification error:', error);
            res.status(500).json({ error: 'Failed to verify MFA' });
        }
    },

    async disableMFA(req, res) {
        try {
            const userId = req.user.id;
            await User.update(userId, { mfa_enabled: false, mfa_secret: null });
            res.status(200).json({ message: 'MFA disabled successfully' });
        } catch (error) {
            console.error('MFA Disable error:', error);
            res.status(500).json({ error: 'Failed to disable MFA' });
        }
    }
};

module.exports = authController;
