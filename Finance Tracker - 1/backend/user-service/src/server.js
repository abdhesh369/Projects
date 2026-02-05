require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

const authMiddleware = require('./middleware/auth');
const User = require('./models/user.model');

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'user-service' });
});

app.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
