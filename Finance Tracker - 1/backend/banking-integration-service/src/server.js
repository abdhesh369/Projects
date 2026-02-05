require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'banking-integration-service' });
});

app.listen(PORT, () => {
    console.log(`Banking Integration Service running on port ${PORT}`);
});
