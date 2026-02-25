/**
 * Service to detect potentially duplicate transactions during imports
 */
const duplicateDetectionService = {
    /**
     * Finds potential duplicates for a new transaction among existing ones
     * @param {Object} newTxn 
     * @param {Array} existingTxns 
     * @returns {Array} List of potential duplicates
     */
    findPotentialDuplicates(newTxn, existingTxns) {
        return existingTxns.filter(existing => {
            // Check if amount is same
            const sameAmount = Math.abs(parseFloat(newTxn.amount) - parseFloat(existing.amount)) < 0.01;

            // Check if date is within 1 day window
            const newDate = new Date(newTxn.date);
            const existingDate = new Date(existing.date);
            const diffDays = Math.abs(newDate - existingDate) / (1000 * 60 * 60 * 24);
            const nearDate = diffDays <= 1;

            // Check for descriptive similarity (simple include or startswith)
            const newDesc = (newTxn.description || '').toLowerCase();
            const existingDesc = (existing.description || '').toLowerCase();
            const similarDesc = newDesc.includes(existingDesc) || existingDesc.includes(newDesc);

            return sameAmount && nearDate && similarDesc;
        });
    },

    /**
     * Checks if a transaction is a likely duplicate
     * @param {Object} txn 
     * @param {Array} history 
     * @returns {boolean}
     */
    isLikelyDuplicate(txn, history) {
        return this.findPotentialDuplicates(txn, history).length > 0;
    }
};

module.exports = duplicateDetectionService;
