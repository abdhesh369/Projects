const Account = require('../models/account.model');
const logger = require('../../../shared/utils/logger');

const balanceService = {
    async updateBalance(accountId, amount, type = 'credit') {
        try {
            const account = await Account.findByIdAndUserId(accountId, null); // userId check might be handled by caller
            if (!account) throw new Error('Account not found');

            let newBalance = parseFloat(account.balance);
            if (type === 'credit') {
                newBalance += parseFloat(amount);
            } else {
                newBalance -= parseFloat(amount);
            }

            return await Account.update(accountId, account.user_id, { balance: newBalance });
        } catch (error) {
            logger.error(`Error updating balance for account ${accountId}:`, error);
            throw error;
        }
    },

    async recalculateTotalBalance(userId) {
        try {
            return await Account.getTotalBalance(userId);
        } catch (error) {
            logger.error(`Error recalculating total balance for user ${userId}:`, error);
            throw error;
        }
    }
};

module.exports = balanceService;
