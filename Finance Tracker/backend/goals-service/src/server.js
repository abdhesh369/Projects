const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const goalRoutes = require('./routes/goal.routes');
const logger = require('../../../shared/utils/logger');

const app = express();
const PORT = process.env.PORT || 3011;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'goals-service' });
});

app.use('/api/goals', goalRoutes);

// Error handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    logger.info(`Goals Service running on port ${PORT}`);
});
