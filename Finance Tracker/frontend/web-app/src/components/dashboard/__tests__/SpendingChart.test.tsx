import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SpendingChart from '../SpendingChart';
import { analyticsService } from '../../../services/analyticsService';

// Mock Recharts to avoid issues with ResponsiveContainer and rendering in Jest
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="responsive-container" style={{ width: '800px', height: '400px' }}>
                {children}
            </div>
        ),
    };
});

// Mock the analytics service
jest.mock('../../../services/analyticsService');

const mockGetSpendingTrend = analyticsService.getSpendingTrend as jest.MockedFunction<typeof analyticsService.getSpendingTrend>;

const mockTrendData = [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 200 },
    { date: '2024-01-03', value: 150 },
];

describe('SpendingChart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockGetSpendingTrend.mockReturnValue(new Promise(() => { }));
        render(<SpendingChart />);
        expect(screen.getByText(/loading chart.../i)).toBeInTheDocument();
    });

    it('renders chart title and legend', async () => {
        mockGetSpendingTrend.mockResolvedValue(mockTrendData);
        render(<SpendingChart />);

        await waitFor(() => {
            expect(screen.queryByText(/loading chart.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Spending Trend')).toBeInTheDocument();
        expect(screen.getByText('Expenses')).toBeInTheDocument();
    });

    it('handles empty trend data', async () => {
        mockGetSpendingTrend.mockResolvedValue([]);
        render(<SpendingChart />);

        await waitFor(() => {
            expect(screen.queryByText(/loading chart.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Spending Trend')).toBeInTheDocument();
    });

    it('handles fetch errors', async () => {
        mockGetSpendingTrend.mockRejectedValue(new Error('Fetch Error'));
        render(<SpendingChart />);

        await waitFor(() => {
            expect(screen.queryByText(/loading chart.../i)).not.toBeInTheDocument();
        });

        // Current implementation just finishes loading and shows an empty chart wrapper on error
        expect(screen.getByText('Spending Trend')).toBeInTheDocument();
    });
});
