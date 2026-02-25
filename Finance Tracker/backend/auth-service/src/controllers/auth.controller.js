const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
const authenticationService = require('../services/authentication.service');
const jwtService = require('../services/jwt.service');
const mfaService = require('../services/mfa.service');

const authController = {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const passwordHash = await authenticationService.hashPassword(password);

            // Create user
            const user = await User.create({
                email,
                passwordHash,
                firstName,
                lastName
            });

            // Generate tokens
            const token = jwtService.generateToken({ id: user.id });
            const refreshToken = jwtService.generateRefreshToken({ id: user.id });

            // Store refresh token
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await RefreshToken.create(user.id, refreshToken, expiresAt);

            res.status(201).json({
                user,
                token,
                refreshToken
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Failed to register user' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate user and credentials
            const user = await authenticationService.validateUser(email, password);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate tokens
            const token = jwtService.generateToken({ id: user.id });
            const refreshToken = jwtService.generateRefreshToken({ id: user.id });

            // Store refresh token (delete old ones first for security)
            await RefreshToken.deleteByUserId(user.id);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await RefreshToken.create(user.id, refreshToken, expiresAt);

            // Remove password hash from response
            delete user.password_hash;

            res.status(200).json({
                user,
                token,
                refreshToken
            });
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
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Failed to logout' });
        }
    },

    async setupMFA(req, res) {
        try {
            const userId = req.user.id;
            const mfaDetails = await mfaService.generateSecret(userId);

            // In a real app, we would store the secret temporarily or encrypt it
            // until the user successfully verifies the first code.
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

            // Mark user as MFA enabled in DB
            await User.update(userId, { mfa_enabled: true, mfa_secret: secret });

            res.status(200).json({ message: 'MFA verified and enabled successfully' });
        } catch (error) {
            console.error('MFA Verification error:', error);
            res.status(500).json({ error: 'Failed to verify MFA' });
        }
    }
};

module.exports = authController;
