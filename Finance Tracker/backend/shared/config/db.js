const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'finance_tracker',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
    logger.error('Shared DB pool error', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
