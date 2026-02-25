import React, { useEffect, useState } from 'react';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../types';
import { format } from 'date-fns';
import { Card } from '../common';
import styles from './TransactionTable.module.css'; // Reusing transaction table styles

interface RecurringTransactionTableProps {
    searchQuery: string;
}

export const RecurringTransactionTable: React.FC<RecurringTransactionTableProps> = ({ searchQuery }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecurring = async () => {
            try {
                setIsLoading(true);
                const data = await transactionService.getRecurringTransactions();
                setTransactions(data);
            } catch (err) {
                setError('Failed to load recurring transactions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecurring();
    }, []);

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <div className={styles.loading}>Loading recurring transactions...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (filteredTransactions.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No recurring transactions found.</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Details</th>
                        <th>Frequency</th>
                        <th>Next Occurrence</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map(transaction => {
                        const amountClass = transaction.type === 'expense' ? styles.expense : styles.income;
                        const sign = transaction.type === 'expense' ? '-' : '+';
                        const frequency = transaction.recurringDetails?.frequency || 'Monthly';
                        const nextDate = new Date(transaction.date); // Rough estimation for UI without complex calculating

                        return (
                            <tr key={transaction.id} className={styles.row}>
                                <td>
                                    <div className={styles.transactionInfo}>
                                        <span className={styles.description}>{transaction.description}</span>
                                        <span className={styles.category}>{transaction.category || 'Uncategorized'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.tag}>{frequency}</span>
                                </td>
                                <td>
                                    {format(nextDate, 'MMM d, yyyy')}
                                </td>
                                <td>
                                    <span className={`${styles.amount} ${amountClass}`}>
                                        {sign}${Math.abs(transaction.amount).toFixed(2)}
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.statusActive}>Active</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
