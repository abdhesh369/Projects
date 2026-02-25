const RecurringTransaction = require('../models/recurring-transaction.model');
const Transaction = require('../models/transaction.model');

const recurringWorker = {
    async processRecurring() {
        console.log('[Worker] Checking for due recurring transactions...');
        try {
            const dueTransactions = await RecurringTransaction.findDue();

            for (const rt of dueTransactions) {
                console.log(`[Worker] Processing recurring transaction: ${rt.description}`);

                // Create the actual transaction
                await Transaction.create({
                    userId: rt.user_id,
                    accountId: rt.account_id,
                    categoryId: rt.category_id,
                    amount: rt.amount,
                    type: rt.type,
                    description: rt.description,
                    date: rt.next_occurrence,
                    isRecurring: true
                });

                // Calculate next occurrence
                const nextDate = this.calculateNextDate(rt.next_occurrence, rt.frequency);

                // Update                // If end_date reached, deactivate
                if (rt.end_date && new Date(rt.end_date) <= new Date()) {
                    await RecurringTransaction.deactivate(rt.id);
                } else {
                    await RecurringTransaction.updateNextOccurrence(rt.id, nextDate);
                }
            }
        } catch (error) {
            console.error('[Worker] Error processing recurring transactions:', error);
        }
    },

    calculateNextDate(currentDate, frequency) {
        const date = new Date(currentDate);
        switch (frequency) {
            case 'daily': date.setDate(date.getDate() + 1); break;
            case 'weekly': date.setDate(date.getDate() + 7); break;
            case 'biweekly': date.setDate(date.getDate() + 14); break;
            case 'monthly': date.setMonth(date.getMonth() + 1); break;
            case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
        }
        return date;
    },

    start(intervalMs = 3600000) { // Default 1 hour
        console.log(`[Worker] Starting recurring transaction worker (interval: ${intervalMs}ms)`);
        setInterval(() => this.processRecurring(), intervalMs);
        // Also run immediately on start
        this.processRecurring();
    }
};

module.exports = recurringWorker;
