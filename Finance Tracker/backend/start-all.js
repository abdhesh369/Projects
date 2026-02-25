const { spawn } = require('child_process');
const path = require('path');

const services = [
    { name: 'auth-service', dir: 'backend/auth-service' },
    { name: 'account-service', dir: 'backend/account-service' },
    { name: 'user-service', dir: 'backend/user-service' },
    { name: 'audit-service', dir: 'backend/audit-service' },
    { name: 'banking-integration', dir: 'backend/banking-integration-service' },
    { name: 'notification-service', dir: 'backend/notification-service' },
    { name: 'budget-service', dir: 'backend/budget-service' },
    { name: 'reporting-service', dir: 'backend/reporting-service' },
    { name: 'transaction-service', dir: 'backend/transaction-service' },
    { name: 'analytics-service', dir: 'backend/analytics-service' },
    { name: 'api-gateway', dir: 'backend/api-gateway' }
];

async function startServices() {
    console.log('Starting all services sequentially...');

    for (const service of services) {
        console.log(`[STARTING] ${service.name}...`);
        const proc = spawn('npm', ['start'], {
            cwd: path.resolve(process.cwd(), service.dir),
            shell: true,
            stdio: 'inherit'
        });

        proc.on('error', (err) => {
            console.error(`[ERROR] ${service.name}: ${err.message}`);
        });

        // Wait a bit between each service
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('All services have been triggered.');
}

startServices();
