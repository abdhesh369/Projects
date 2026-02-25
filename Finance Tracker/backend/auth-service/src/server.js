const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Startup validation
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET not configured');
  process.exit(1);
}
if (!process.env.INTERNAL_SERVICE_TOKEN) {
  console.error('FATAL: INTERNAL_SERVICE_TOKEN not configured');
  process.exit(1);
}
if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
  console.error('FATAL: DB_PASSWORD not configured for production');
  process.exit(1);
}

// SECURITY: Hardening
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service' });
});

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
