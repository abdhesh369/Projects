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

            // Fix Issue #5: Include email and role in token
            const token = jwtService.generateToken({ id: user.id, email: user.email, role: user.role });
            const refreshToken = jwtService.generateRefreshToken({ id: user.id });

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await RefreshToken.create(user.id, refreshToken, expiresAt);

            // Track session
            const deviceInfo = req.headers['user-agent'] || 'Unknown';
            const ipAddress = req.ip || req.connection.remoteAddress;
            await Session.create(user.id, token, deviceInfo, ipAddress);

            // Fix Issue #17: Safe object copy instead of mutation
            const { password_hash: _, ...safeUser } = user;
            res.status(201).json({ user: safeUser, token, refreshToken });
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

            // Fix Issue #5: Include email and role in token
            const token = jwtService.generateToken({ id: user.id, email: user.email, role: user.role });
            const refreshToken = jwtService.generateRefreshToken({ id: user.id });

            await RefreshToken.deleteByUserId(user.id);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await RefreshToken.create(user.id, refreshToken, expiresAt);

            // Track session
            const deviceInfo = req.headers['user-agent'] || 'Unknown';
            const ipAddress = req.ip || req.connection.remoteAddress;
            await Session.create(user.id, token, deviceInfo, ipAddress);

            // Fix Issue #17: Safe object copy instead of mutation
            const { password_hash: _, mfa_secret: __, ...safeUser } = user;

            res.status(200).json({ user: safeUser, token, refreshToken });
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

            // Fix Issue #5: Need email/role for token, fetch user
            const user = await User.findById(payload.id);
            if (!user) return res.status(401).json({ error: 'User not found' });

            const token = jwtService.generateToken({ id: user.id, email: user.email, role: user.role });

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
            const { code } = req.body; // Secret removed from req.body (Fix Issue #1)

            const secret = await mfaService.getPendingSecret(userId);
            if (!secret) {
                return res.status(400).json({ error: 'MFA setup session expired. Please restart setup.' });
            }

            const isValid = await mfaService.verifyCode(userId, code, secret);
            if (!isValid) {
                return res.status(400).json({ error: 'Invalid MFA code' });
            }

            await User.update(userId, { mfa_enabled: true, mfa_secret: secret });
            await mfaService.clearPendingSecret(userId);

            res.status(200).json({ message: 'MFA verified and enabled successfully' });
        } catch (error) {
            console.error('MFA Verification error:', error);
            res.status(500).json({ error: 'Failed to verify MFA' });
        }
    },

    async disableMFA(req, res) {
        try {
            const userId = req.user.id;
            const { code, password } = req.body;

            // Fix Issue #2: Require MFA code or password to disable
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ error: 'User not found' });

            // If MFA is active, require code. If not, maybe just password or nothing (but here it should be active if they want to disable)
            const dbUser = await User.findByEmail(user.email); // Need secret for verification

            if (dbUser.mfa_enabled) {
                if (!code) return res.status(400).json({ error: 'MFA code required to disable MFA' });
                const isValid = await mfaService.verifyCode(userId, code, dbUser.mfa_secret);
                if (!isValid) return res.status(401).json({ error: 'Invalid MFA code' });
            } else if (password) {
                const isValidPassword = await authenticationService.validateUser(user.email, password);
                if (!isValidPassword) return res.status(401).json({ error: 'Invalid password' });
            } else {
                return res.status(400).json({ error: 'MFA code or password required' });
            }

            await User.update(userId, { mfa_enabled: false, mfa_secret: null });
            res.status(200).json({ message: 'MFA disabled successfully' });
        } catch (error) {
            console.error('MFA Disable error:', error);
            res.status(500).json({ error: 'Failed to disable MFA' });
        }
    }
};

module.exports = authController;
