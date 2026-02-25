const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const auditRoutes = require('./routes/audit.routes');

const app = express();
const PORT = process.env.PORT || 3004;

if (!process.env.INTERNAL_SERVICE_TOKEN) {
    console.error('FATAL: INTERNAL_SERVICE_TOKEN not configured');
    process.exit(1);
}

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'audit-service' });
});

// Routes
app.use('/', auditRoutes);

app.listen(PORT, () => {
    console.log(`Audit Service running on port ${PORT}`);
});
