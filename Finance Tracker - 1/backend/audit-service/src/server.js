require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'audit-service' });
});

app.listen(PORT, () => {
    console.log(`Audit Service running on port ${PORT}`);
});
