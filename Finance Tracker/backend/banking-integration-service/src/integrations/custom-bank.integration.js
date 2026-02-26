const logger = require('../../../shared/utils/logger');

/**
 * Custom Bank Integration Client Stub
 * Used for manual file imports or direct bank API integrations not covered by Plaid/Yodlee.
 */
const customBankClient = {
    async importCSV(filePath) {
        logger.info(`Importing custom bank CSV from ${filePath}`);
        return [];
    }
};

module.exports = customBankClient;
