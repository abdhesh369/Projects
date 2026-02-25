const db = require('../config/db');
const Transaction = require('./transaction.model');

jest.mock('../config/db', () => ({
    query: jest.fn(),
    connect: jest.fn()
}));

describe('Transaction Model - getSpendingTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should use a subquery to fetch recent months and then order them chronologically', async () => {
        db.query.mockResolvedValue({
            rows: [
                { month: '2023-01', value: 100 },
                { month: '2023-02', value: 150 }
            ]
        });

        const result = await Transaction.getSpendingTrend(1, { limit: 12 });

        // Assert db.query is called
        expect(db.query).toHaveBeenCalledTimes(1);

        const SQL = db.query.mock.calls[0][0];

        // Assert Subquery structure and ordering
        expect(SQL).toContain('ORDER BY month DESC');
        expect(SQL).toContain('LIMIT $2');
        expect(SQL).toContain('ORDER BY month ASC');

        expect(result).toHaveLength(2);
        expect(result[0].month).toBe('2023-01');
    });
});
