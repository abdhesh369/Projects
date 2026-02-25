const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || 'placeholder_client_id';
const PLAID_SECRET = process.env.PLAID_SECRET || 'placeholder_secret';
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

module.exports = plaidClient;
