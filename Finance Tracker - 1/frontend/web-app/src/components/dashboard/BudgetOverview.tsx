import React from 'react';
import styles from './BudgetOverview.module.css';

interface Budget {
    id: string;
    name: string;
    spent: number;
    limit: number;
    color: string;
}

// Demo data
const budgets: Budget[] = [
    { id: '1', name: 'Food & Dining', spent: 420, limit: 500, color: '#F59E0B' },
    { id: '2', name: 'Transportation', spent: 180, limit: 200, color: '#8B5CF6' },
    { id: '3', name: 'Entertainment', spent: 95, limit: 150, color: '#EC4899' },
    { id: '4', name: 'Shopping', spent: 350, limit: 300, color: '#EF4444' },
    { id: '5', name: 'Utilities', spent: 145, limit: 200, color: '#10B981' },
];

export const BudgetOverview: React.FC = () => {
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const getProgressPercentage = (spent: number, limit: number) => {
        return Math.min((spent / limit) * 100, 100);
    };

    const isOverBudget = (spent: number, limit: number) => {
        return spent > limit;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Budget Overview</h3>
                <button className={styles.viewAll}>Manage</button>
            </div>

            <div className={styles.list}>
                {budgets.map((budget) => {
                    const percentage = getProgressPercentage(budget.spent, budget.limit);
                    const overBudget = isOverBudget(budget.spent, budget.limit);

                    return (
                        <div key={budget.id} className={styles.item}>
                            <div className={styles.itemHeader}>
                                <div className={styles.itemInfo}>
                                    <span
                                        className={styles.dot}
                                        style={{ backgroundColor: budget.color }}
                                    />
                                    <span className={styles.name}>{budget.name}</span>
                                </div>
                                <div className={styles.amounts}>
                                    <span className={overBudget ? styles.overBudget : ''}>
                                        {formatCurrency(budget.spent)}
                                    </span>
                                    <span className={styles.separator}>/</span>
                                    <span className={styles.limit}>{formatCurrency(budget.limit)}</span>
                                </div>
                            </div>

                            <div className={styles.progressBar}>
                                <div
                                    className={`${styles.progress} ${overBudget ? styles.danger : ''}`}
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: overBudget ? 'var(--color-danger)' : budget.color,
                                    }}
                                />
                            </div>

                            {overBudget && (
                                <span className={styles.warningText}>
                                    Over by {formatCurrency(budget.spent - budget.limit)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetOverview;
