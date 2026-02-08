const User = require('../models/user.model');
const authenticationService = require('../services/authentication.service');
const jwtService = require('../services/jwt.service');

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

            // Generate token
            const token = jwtService.generateToken({ id: user.id });

            res.status(201).json({
                user,
                token
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

            // Generate token
            const token = jwtService.generateToken({ id: user.id });

            // Remove password hash from response
            delete user.password_hash;

            res.status(200).json({
                user,
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Failed to login' });
        }
    }
};

module.exports = authController;
