require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'reporting-service' });
});

app.listen(PORT, () => {
    console.log(`Reporting Service running on port ${PORT}`);
});
