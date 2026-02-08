import React, { useEffect, useState } from 'react';
import {
    ShoppingBagIcon,
    HomeIcon,
    TruckIcon,
    FilmIcon,
    BoltIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../types';
import styles from './RecentTransactions.module.css';

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
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await transactionService.getRecentTransactions(5);
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch recent transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const formatAmount = (amount: number) => {
        const value = Number(amount);
        const formatted = Math.abs(value).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return value >= 0 ? `+${formatted}` : `-${formatted}`;
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
                {isLoading ? (
                    <p>Loading transactions...</p>
                ) : transactions.length > 0 ? (
                    transactions.map((transaction) => {
                        const category = transaction.category?.toLowerCase() || 'shopping';
                        return (
                            <div key={transaction.id} className={styles.item}>
                                <div
                                    className={styles.iconWrapper}
                                    style={{ backgroundColor: `${categoryColors[category] || '#94A3B8'}20` }}
                                >
                                    <span style={{ color: categoryColors[category] || '#94A3B8' }}>
                                        {categoryIcons[category] || <CurrencyDollarIcon />}
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
                        );
                    })
                ) : (
                    <p>No recent transactions.</p>
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;
