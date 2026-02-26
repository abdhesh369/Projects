import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BudgetOverview from '../BudgetOverview';
import { analyticsService } from '../../../services/analyticsService';

// Mock the analytics service
jest.mock('../../../services/analyticsService');

const mockGetCategoryBreakdown = analyticsService.getCategoryBreakdown as jest.MockedFunction<typeof analyticsService.getCategoryBreakdown>;

const mockBreakdown = [
    {
        categoryId: '1',
        categoryName: 'Food',
        amount: 450,
        percentage: 90,
        color: '#FF6B6B',
    },
    {
        categoryId: '2',
        categoryName: 'Rent',
        amount: 1200,
        percentage: 120, // Over budget
        color: '#4D96FF',
    },
];

describe('BudgetOverview', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockGetCategoryBreakdown.mockReturnValue(new Promise(() => { }));
        render(<BudgetOverview />);
        expect(screen.getByText(/loading budgets.../i)).toBeInTheDocument();
    });

    it('renders category breakdown when data is fetched', async () => {
        mockGetCategoryBreakdown.mockResolvedValue(mockBreakdown);
        render(<BudgetOverview />);

        await waitFor(() => {
            expect(screen.queryByText(/loading budgets.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Rent')).toBeInTheDocument();

        // Check amounts (BudgetOverview formats with no decimals)
        expect(screen.getByText('$450')).toBeInTheDocument();
        expect(screen.getByText('$1,200')).toBeInTheDocument();

        // Check percentages
        expect(screen.getByText('(90%)')).toBeInTheDocument();
        expect(screen.getByText('(120%)')).toBeInTheDocument();
    });

    it('applies "overBudget" style when percentage > 100', async () => {
        mockGetCategoryBreakdown.mockResolvedValue(mockBreakdown);
        const { container } = render(<BudgetOverview />);

        await waitFor(() => {
            expect(screen.getByText('Rent')).toBeInTheDocument();
        });

        // The "Rent" amount should have the overBudget class
        const rentAmount = screen.getByText('$1,200');
        expect(rentAmount).toHaveClass('overBudget');

        // Check progress bar color (over budget should use var(--color-danger))
        // We can't easily check styled-components or CSS module class names directly without the actual mapping,
        // but we can check if it has the 'danger' class or inline styles.
        const progressBar = container.querySelector('.progress.danger');
        expect(progressBar).toBeInTheDocument();
    });

    it('renders empty state when no data is returned', async () => {
        mockGetCategoryBreakdown.mockResolvedValue([]);
        render(<BudgetOverview />);

        await waitFor(() => {
            expect(screen.getByText(/no budget data available/i)).toBeInTheDocument();
        });
    });
});
