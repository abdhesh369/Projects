import React from 'react';
import { render, screen } from '@testing-library/react';
import SummaryCard from '../SummaryCard';

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => {
    const actual = jest.requireActual('@heroicons/react/24/outline');
    return {
        ...actual,
        ArrowTrendingUpIcon: () => <div data-testid="trending-up-icon" />,
        ArrowTrendingDownIcon: () => <div data-testid="trending-down-icon" />,
    };
});

describe('SummaryCard', () => {
    const defaultProps = {
        title: 'Total Balance',
        value: '$12,345.00',
        icon: <div data-testid="test-icon" />,
    };

    it('renders basic information correctly', () => {
        render(<SummaryCard {...defaultProps} />);

        expect(screen.getByText('Total Balance')).toBeInTheDocument();
        expect(screen.getByText('$12,345.00')).toBeInTheDocument();
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders positive change correctly', () => {
        render(<SummaryCard {...defaultProps} change={5.2} />);

        expect(screen.getByText('+5.2%')).toBeInTheDocument();
        expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
        expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('renders negative change correctly', () => {
        render(<SummaryCard {...defaultProps} change={-2.5} />);

        expect(screen.getByText('-2.5%')).toBeInTheDocument();
        expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
    });

    it('respects custom change label', () => {
        render(<SummaryCard {...defaultProps} change={1.0} changeLabel="since yesterday" />);

        expect(screen.getByText('since yesterday')).toBeInTheDocument();
    });

    it('applies correct variant class', () => {
        const { container } = render(<SummaryCard {...defaultProps} variant="income" />);

        // Check if the card has the 'income' class
        // Note: With CSS modules, we check if the class list contains any class ending with 'income'
        const firstChild = container.firstChild as HTMLElement;
        const hasIncomeClass = Array.from(firstChild.classList).some(cls => cls.includes('income'));
        expect(hasIncomeClass).toBe(true);
    });
});
