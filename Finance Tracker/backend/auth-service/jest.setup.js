process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-test';
process.env.REFRESH_SECRET = 'test-refresh-key-that-is-long-enough-for-test';
process.env.INTERNAL_SERVICE_TOKEN = 'test-internal-token-32-chars-long';

process.exit = (code) => {
    throw new Error(`process.exit called with ${code}`);
};
