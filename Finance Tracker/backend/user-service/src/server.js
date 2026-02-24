require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

const authMiddleware = require('./middleware/auth');
const userRoutes = require('./routes/user.routes');

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'user-service' });
});

app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
