const Account = require('../models/account.model');
const logger = require('../../../shared/utils/logger');

const accountService = {
    async createAccount(userId, accountData) {
        try {
            return await Account.create({ userId, ...accountData });
        } catch (error) {
            logger.error('Create account service error:', error);
            throw error;
        }
    },

    async getAccounts(userId) {
        try {
            return await Account.findAllByUserId(userId);
        } catch (error) {
            logger.error('Get accounts service error:', error);
            throw error;
        }
    },

    async getAccountById(id, userId) {
        try {
            return await Account.findByIdAndUserId(id, userId);
        } catch (error) {
            logger.error('Get account by ID service error:', error);
            throw error;
        }
    },

    async updateAccount(id, userId, updates) {
        try {
            return await Account.update(id, userId, updates);
        } catch (error) {
            logger.error('Update account service error:', error);
            throw error;
        }
    },

    async deleteAccount(id, userId) {
        try {
            return await Account.delete(id, userId);
        } catch (error) {
            logger.error('Delete account service error:', error);
            throw error;
        }
    }
};

module.exports = accountService;
