require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Routes
const accountRoutes = require('./routes/account.routes');
app.use('/', accountRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'account-service' });
});

app.listen(PORT, () => {
    console.log(`Account Service running on port ${PORT}`);
});
