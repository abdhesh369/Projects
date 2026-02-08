require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(cors());

// Proxy routes
const routes = {
    '/auth': 'http://localhost:3001',
    '/accounts': 'http://localhost:3002',
    '/analytics': 'http://localhost:3003',
    '/audit': 'http://localhost:3004',
    '/banking': 'http://localhost:3005',
    '/budget': 'http://localhost:3006',
    '/notifications': 'http://localhost:3007',
    '/reporting': 'http://localhost:3008',
    '/transactions': 'http://localhost:3009',
    '/users': 'http://localhost:3010'
};

for (const [path, target] of Object.entries(routes)) {
    app.use(path, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${path}`]: '',
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[Proxy] ${req.method} ${req.url} -> ${target}`);
        }
    }));
}

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
