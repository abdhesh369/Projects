const logger = require('../../../shared/utils/logger');
const Account = require('../models/account.model');

const accountController = {
    async createAccount(req, res) {
        try {
            const userId = req.user.id;
            const { name, type, balance, currency, institution, color, icon } = req.body;


            const account = await Account.create({
                userId,
                name,
                type,
                balance: balance || 0,
                currency: currency || 'USD',
                institution,
                color: color || '#000000',
                icon
            });

            res.status(201).json(account);
        } catch (error) {
            logger.error('Create account error:', error);
            res.status(500).json({ error: 'Failed to create account' });
        }
    },

    async getAllAccounts(req, res) {
        try {
            const userId = req.user.id;
            const accounts = await Account.findAllByUserId(userId);
            res.status(200).json(accounts);
        } catch (error) {
            logger.error('Get all accounts error:', error);
            res.status(500).json({ error: 'Failed to fetch accounts' });
        }
    },

    async getAccountById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const account = await Account.findByIdAndUserId(id, userId);

            if (!account) {
                return res.status(404).json({ error: 'Account not found' });
            }

            res.status(200).json(account);
        } catch (error) {
            logger.error('Get account error:', error);
            res.status(500).json({ error: 'Failed to fetch account' });
        }
    },

    async updateAccount(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updates = req.body;

            const account = await Account.update(id, userId, updates);

            if (!account) {
                return res.status(404).json({ error: 'Account not found or no changes made' });
            }

            res.status(200).json(account);
        } catch (error) {
            logger.error('Update account error:', error);
            res.status(500).json({ error: 'Failed to update account' });
        }
    },

    async deleteAccount(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const account = await Account.delete(id, userId);

            if (!account) {
                return res.status(404).json({ error: 'Account not found' });
            }

            res.status(200).json({ message: 'Account deleted successfully' });
        } catch (error) {
            logger.error('Delete account error:', error);
            res.status(500).json({ error: 'Failed to delete account' });
        }
    },

    async getTotalBalance(req, res) {
        try {
            const userId = req.user.id;
            const result = await Account.getTotalBalance(userId);
            res.status(200).json(result);
        } catch (error) {
            logger.error('Get total balance error:', error);
            res.status(500).json({ error: 'Failed to fetch total balance' });
        }
    }
};

module.exports = accountController;
