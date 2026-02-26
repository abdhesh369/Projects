const duplicateDetectionService = require('../services/duplicate-detection.service');
const categorizationService = require('../services/categorization.service');

describe('Transaction Service Logic', () => {
    describe('Categorization Service', () => {
        it('should categorize "Starbucks Coffee" as food', () => {
            expect(categorizationService.categorize('Starbucks Coffee')).toBe('food');
        });

        it('should categorize "Uber Trip" as transportation', () => {
            expect(categorizationService.categorize('Uber Trip')).toBe('transportation');
        });

        it('should categorize "Amazon Order" as shopping', () => {
            expect(categorizationService.categorize('Amazon Order')).toBe('shopping');
        });

        it('should return null for unknown descriptions', () => {
            expect(categorizationService.categorize('Generic Store 123')).toBeNull();
        });

        it('should respect word boundaries (gas vs glass)', () => {
            expect(categorizationService.categorize('Glass repair')).toBeNull();
            expect(categorizationService.categorize('Gas station')).toBe('transportation');
        });
    });

    describe('Duplicate Detection Service', () => {
        const existingTxns = [
            { id: '1', amount: '50.00', date: '2026-02-26', description: 'Grocery Store' },
            { id: '2', amount: '20.00', date: '2026-02-25', description: 'Uber Trip' }
        ];

        it('should detect an exact duplicate', () => {
            const newTxn = { amount: '50.00', date: '2026-02-26', description: 'Grocery Store' };
            const duplicates = duplicateDetectionService.findPotentialDuplicates(newTxn, existingTxns);
            expect(duplicates.length).toBe(1);
            expect(duplicates[0].id).toBe('1');
        });

        it('should detect a duplicate with slightly different description', () => {
            const newTxn = { amount: '50.00', date: '2026-02-26', description: 'GROCERY STORE' };
            const duplicates = duplicateDetectionService.findPotentialDuplicates(newTxn, existingTxns);
            expect(duplicates.length).toBe(1);
        });

        it('should detect a duplicate with 1 day date difference', () => {
            const newTxn = { amount: '50.00', date: '2026-02-27', description: 'Grocery Store' };
            const duplicates = duplicateDetectionService.findPotentialDuplicates(newTxn, existingTxns);
            expect(duplicates.length).toBe(1);
        });

        it('should not detect a duplicate if amount differs', () => {
            const newTxn = { amount: '51.00', date: '2026-02-26', description: 'Grocery Store' };
            const duplicates = duplicateDetectionService.findPotentialDuplicates(newTxn, existingTxns);
            expect(duplicates.length).toBe(0);
        });

        it('should not detect a duplicate if date is > 1 day away', () => {
            const newTxn = { amount: '50.00', date: '2026-03-01', description: 'Grocery Store' };
            const duplicates = duplicateDetectionService.findPotentialDuplicates(newTxn, existingTxns);
            expect(duplicates.length).toBe(0);
        });
    });
});
