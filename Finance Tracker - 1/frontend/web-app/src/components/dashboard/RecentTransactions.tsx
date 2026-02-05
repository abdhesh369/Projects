import React from 'react';
import {
    ShoppingBagIcon,
    HomeIcon,
    TruckIcon,
    FilmIcon,
    BoltIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import styles from './RecentTransactions.module.css';

interface Transaction {
    id: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
}

// Demo data
const transactions: Transaction[] = [
    { id: '1', description: 'Grocery Shopping', category: 'shopping', amount: -85.50, type: 'expense', date: '2026-02-04' },
    { id: '2', description: 'Salary Deposit', category: 'income', amount: 4500.00, type: 'income', date: '2026-02-03' },
    { id: '3', description: 'Electric Bill', category: 'utilities', amount: -120.00, type: 'expense', date: '2026-02-02' },
    { id: '4', description: 'Netflix Subscription', category: 'entertainment', amount: -15.99, type: 'expense', date: '2026-02-01' },
    { id: '5', description: 'Rent Payment', category: 'housing', amount: -1200.00, type: 'expense', date: '2026-02-01' },
];

const categoryIcons: Record<string, React.ReactNode> = {
    shopping: <ShoppingBagIcon />,
    housing: <HomeIcon />,
    transport: <TruckIcon />,
    entertainment: <FilmIcon />,
    utilities: <BoltIcon />,
    income: <CurrencyDollarIcon />,
};

const categoryColors: Record<string, string> = {
    shopping: '#F59E0B',
    housing: '#6366F1',
    transport: '#8B5CF6',
    entertainment: '#EC4899',
    utilities: '#10B981',
    income: '#22C55E',
};

export const RecentTransactions: React.FC = () => {
    const formatAmount = (amount: number) => {
        const formatted = Math.abs(amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return amount >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Recent Transactions</h3>
                <button className={styles.viewAll}>View All</button>
            </div>

            <div className={styles.list}>
                {transactions.map((transaction) => (
                    <div key={transaction.id} className={styles.item}>
                        <div
                            className={styles.iconWrapper}
                            style={{ backgroundColor: `${categoryColors[transaction.category]}20` }}
                        >
                            <span style={{ color: categoryColors[transaction.category] }}>
                                {categoryIcons[transaction.category]}
                            </span>
                        </div>

                        <div className={styles.details}>
                            <span className={styles.description}>{transaction.description}</span>
                            <span className={styles.date}>{formatDate(transaction.date)}</span>
                        </div>

                        <span className={`${styles.amount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
                            {formatAmount(transaction.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentTransactions;
