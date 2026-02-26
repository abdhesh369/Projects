const logger = require('../../../shared/utils/logger');
const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
const Session = require('../models/session.model');
const authenticationService = require('../services/authentication.service');
const jwtService = require('../services/jwt.service');
const mfaService = require('../services/mfa.service');
const crypto = require('crypto');
const redis = require('../config/redis');
const auditLogger = require('../../../shared/utils/audit-logger');

// Ensure sessions table exists on startup
Session.ensureTable().catch(err => logger.error('Failed to create sessions table:', err.message));

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
            const ipAddress = req.ip || req.socket.remoteAddress;
            await Session.create(user.id, token, deviceInfo, ipAddress);

            // AUDIT: Log registration (M-04)
            await auditLogger.log({
                userId: user.id,
                action: 'REGISTER',
                entityType: 'USER',
                entityId: user.id,
                ipAddress,
                userAgent: deviceInfo
            });

            // Fix Issue #17: Safe object copy instead of mutation
            const { password_hash: _, ...safeUser } = user;

            // Fix Issue #16: Use httpOnly cookies
            res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000 });

            res.status(201).json({ user: safeUser });
        } catch (error) {
            logger.error('Registration error:', error);
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
            const ipAddress = req.ip || req.socket.remoteAddress;
            await Session.create(user.id, token, deviceInfo, ipAddress);

            // AUDIT: Log login (M-04)
            await auditLogger.log({
                userId: user.id,
                action: 'LOGIN',
                entityType: 'USER',
                entityId: user.id,
                ipAddress,
                userAgent: deviceInfo
            });

            // Fix Issue #17: Safe object copy instead of mutation
            const { password_hash: _, mfa_secret: __, ...safeUser } = user;

            // Fix Issue #16: Use httpOnly cookies
            res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000 });

            res.status(200).json({ user: safeUser });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({ error: 'Failed to login' });
        }
    },

    async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
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
            const ipAddress = req.ip || req.socket.remoteAddress;
            await Session.create(payload.id, token, deviceInfo, ipAddress);

            // Fix Issue #16: Update access token cookie
            res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });

            res.status(200).json({ success: true });
        } catch (error) {
            logger.error('Refresh error:', error);
            res.status(500).json({ error: 'Failed to refresh token' });
        }
    },

    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) {
                await RefreshToken.deleteByToken(refreshToken);
            }

            // Remove session for the current token
            const authHeader = req.headers.authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            } else if (req.cookies && req.cookies.accessToken) {
                token = req.cookies.accessToken;
            }

            if (token) await Session.deleteByToken(token);

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            logger.error('Logout error:', error);
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
            let currentToken = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                currentToken = authHeader.split(' ')[1];
            } else if (req.cookies && req.cookies.accessToken) {
                currentToken = req.cookies.accessToken;
            }

            let removedCount;
            if (currentToken) {
                removedCount = await Session.deleteOthersByUserId(userId, currentToken);
            } else {
                removedCount = await Session.deleteAllByUserId(userId);
            }

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

            res.status(200).json({
                message: `Logged out of ${removedCount} other device(s) successfully`
            });
        } catch (error) {
            logger.error('LogoutAll error:', error);
            res.status(500).json({ error: 'Failed to logout all devices' });
        }
    },

    async getSessions(req, res) {
        try {
            const userId = req.user.id;
            const sessions = await Session.findByUserId(userId);
            res.status(200).json({ sessions });
        } catch (error) {
            logger.error('GetSessions error:', error);
            res.status(500).json({ error: 'Failed to fetch sessions' });
        }
    },

    async setupMFA(req, res) {
        try {
            const userId = req.user.id;
            const mfaDetails = await mfaService.generateSecret(userId);
            res.status(200).json(mfaDetails);
        } catch (error) {
            logger.error('MFA Setup error:', error);
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

            // AUDIT: Log MFA enablement (M-04)
            await auditLogger.log({
                userId,
                action: 'MFA_ENABLED',
                entityType: 'USER',
                entityId: userId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.status(200).json({ message: 'MFA verified and enabled successfully' });
        } catch (error) {
            logger.error('MFA Verification error:', error);
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

            // AUDIT: Log MFA disablement (M-04)
            await auditLogger.log({
                userId,
                action: 'MFA_DISABLED',
                entityType: 'USER',
                entityId: userId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.status(200).json({ message: 'MFA disabled successfully' });
        } catch (error) {
            logger.error('MFA Disable error:', error);
            res.status(500).json({ error: 'Failed to disable MFA' });
        }
    },

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: 'Email is required' });

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

            await redis.set(`pwdreset:${tokenHash}`, user.id, 'EX', 3600);

            logger.info(`[Auth] Forgot Password URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

            // AUDIT: Log forgot password request (M-04)
            await auditLogger.log({
                userId: user.id,
                action: 'PASSWORD_RESET_REQUESTED',
                entityType: 'USER',
                entityId: user.id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
        } catch (error) {
            logger.error('Forgot password error:', error);
            res.status(500).json({ error: 'Failed to process request' });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });

            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const userId = await redis.get(`pwdreset:${tokenHash}`);

            if (!userId) {
                return res.status(400).json({ error: 'Invalid or expired reset token' });
            }

            const passwordHash = await authenticationService.hashPassword(newPassword);
            await User.update(userId, { password_hash: passwordHash });

            await redis.del(`pwdreset:${tokenHash}`);
            await Session.deleteAllByUserId(userId);
            await RefreshToken.deleteByUserId(userId);

            // AUDIT: Log password reset completion (M-04)
            await auditLogger.log({
                userId,
                action: 'PASSWORD_RESET_COMPLETED',
                entityType: 'USER',
                entityId: userId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            logger.error('Reset password error:', error);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    }
};

module.exports = authController;
