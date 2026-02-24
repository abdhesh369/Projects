import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { CategoryBreakdown } from '../../types';
import styles from './BudgetOverview.module.css';

export const BudgetOverview: React.FC = () => {
    const [budgets, setBudgets] = useState<CategoryBreakdown[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const breakdown = await analyticsService.getCategoryBreakdown();
                setBudgets(breakdown);
            } catch (error) {
                console.error('Failed to fetch budget breakdown:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBudgets();
    }, []);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const getProgressPercentage = (percentage: number) => {
        return Math.min(percentage, 100);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Spending by Category</h3>
                <button className={styles.viewAll}>Details</button>
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <p>Loading budgets...</p>
                ) : budgets.length > 0 ? (
                    budgets.map((budget) => {
                        const percentage = getProgressPercentage(budget.percentage);
                        const overBudget = budget.percentage > 100;

                        return (
                            <div key={budget.categoryId} className={styles.item}>
                                <div className={styles.itemHeader}>
                                    <div className={styles.itemInfo}>
                                        <span
                                            className={styles.dot}
                                            style={{ backgroundColor: budget.color }}
                                        />
                                        <span className={styles.name}>{budget.categoryName}</span>
                                    </div>
                                    <div className={styles.amounts}>
                                        <span className={overBudget ? styles.overBudget : ''}>
                                            {formatCurrency(budget.amount)}
                                        </span>
                                        <span className={styles.separator}>({Math.round(budget.percentage)}%)</span>
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
                            </div>
                        );
                    })
                ) : (
                    <p>No budget data available.</p>
                )}
            </div>
        </div>
    );
};

export default BudgetOverview;
