const axios = require('axios');

const services = [
    { name: 'API Gateway', url: 'http://127.0.0.1:5000/health' },
    { name: 'Auth Service', url: 'http://127.0.0.1:3001/health' },
    { name: 'Account Service', url: 'http://127.0.0.1:3002/health' },
    { name: 'Analytics Service', url: 'http://127.0.0.1:3003/health' },
    { name: 'Audit Service', url: 'http://127.0.0.1:3004/health' },
    { name: 'Banking Integration', url: 'http://127.0.0.1:3005/health' },
    { name: 'Budget Service', url: 'http://127.0.0.1:3006/health' },
    { name: 'Notification Service', url: 'http://127.0.0.1:3007/health' },
    { name: 'Reporting Service', url: 'http://127.0.0.1:3008/health' },
    { name: 'Transaction Service', url: 'http://127.0.0.1:3009/health' },
    { name: 'User Service', url: 'http://127.0.0.1:3010/health' }
];

async function runHealthChecks() {
    console.log('--- Integrated Health Checks ---');
    for (const service of services) {
        try {
            const response = await axios.get(service.url);
            console.log(`[OK] ${service.name} (${service.url}): ${response.data.status || 'UP'}`);
        } catch (error) {
            console.log(`[FAILED] ${service.name} (${service.url}): ${error.message}`);
        }
    }
    console.log('--------------------------------');
}

runHealthChecks();
