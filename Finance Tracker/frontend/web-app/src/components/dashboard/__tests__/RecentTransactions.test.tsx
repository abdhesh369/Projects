import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RecentTransactions from '../RecentTransactions';
import { transactionService } from '../../../services/transactionService';

// Mock the transaction service
jest.mock('../../../services/transactionService');

const mockGetRecentTransactions = transactionService.getRecentTransactions as jest.MockedFunction<typeof transactionService.getRecentTransactions>;

const mockTransactions = [
    {
        id: '1',
        userId: 'user-1',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        description: 'Starbucks',
        amount: -5.5,
        category: 'shopping',
        date: new Date().toISOString(),
        type: 'expense' as const,
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        userId: 'user-1',
        accountId: 'acc-1',
        categoryId: 'cat-2',
        description: 'Monthly Salary',
        amount: 3000,
        category: 'income',
        date: new Date().toISOString(),
        type: 'income' as const,
        isRecurring: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

describe('RecentTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockGetRecentTransactions.mockReturnValue(new Promise(() => { }));
        render(<RecentTransactions />);
        expect(screen.getByText(/loading transactions.../i)).toBeInTheDocument();
    });

    it('renders transactions list when data is fetched', async () => {
        mockGetRecentTransactions.mockResolvedValue(mockTransactions);
        render(<RecentTransactions />);

        await waitFor(() => {
            expect(screen.queryByText(/loading transactions.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Starbucks')).toBeInTheDocument();
        expect(screen.getByText('Monthly Salary')).toBeInTheDocument();

        // Check formatting (SummaryCard logic was slightly different, let's check RecentTransactions.tsx)
        // formatAmount: value >= 0 ? `+${formatted}` : `-${formatted}`
        expect(screen.getByText('-$5.50')).toBeInTheDocument();
        expect(screen.getByText('+$3,000.00')).toBeInTheDocument();
    });

    it('renders empty state when no transactions are returned', async () => {
        mockGetRecentTransactions.mockResolvedValue([]);
        render(<RecentTransactions />);

        await waitFor(() => {
            expect(screen.getByText(/no recent transactions/i)).toBeInTheDocument();
        });
    });

    it('handles service errors gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockGetRecentTransactions.mockRejectedValue(new Error('Network Error'));

        render(<RecentTransactions />);

        await waitFor(() => {
            expect(screen.queryByText(/loading transactions.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText(/no recent transactions/i)).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
