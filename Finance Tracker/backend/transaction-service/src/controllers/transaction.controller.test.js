const transactionController = require('./transaction.controller');
const transactionService = require('../services/transaction.service');

jest.mock('../services/transaction.service');

describe('Transaction Controller - list', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            user: { id: 1 },
            query: { limit: '10', offset: '20' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should return transactions inside a data object and include pagination metadata', async () => {
        const mockTransactions = [{ id: 1, amount: 100 }];
        const mockTotal = 50;

        transactionService.getTransactions.mockResolvedValue({
            transactions: mockTransactions,
            total: mockTotal
        });

        await transactionController.list(req, res);

        expect(transactionService.getTransactions).toHaveBeenCalledWith(1, {
            limit: 10, offset: 20, startDate: undefined, endDate: undefined, categoryId: undefined, type: undefined
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: mockTransactions,
            pagination: {
                total: 50,
                limit: 10,
                offset: 20
            }
        });
    });

    it('should handle undefined limit and offset with defaults', async () => {
        req.query = {};

        transactionService.getTransactions.mockResolvedValue({
            transactions: [],
            total: 0
        });

        await transactionController.list(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            pagination: {
                total: 0,
                limit: 50,
                offset: 0
            }
        });
    });
});
