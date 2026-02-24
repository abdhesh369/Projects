import React, { useState } from 'react';
import Head from 'next/head';
import {
    PlusIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Layout, Button, Card } from '../components/common';
import styles from '../styles/Budgets.module.css';

interface Budget {
    id: string;
    name: string;
    category: string;
    spent: number;
    limit: number;
    color: string;
    period: 'weekly' | 'monthly' | 'yearly';
}

const budgets: Budget[] = [
    { id: '1', name: 'Food & Dining', category: 'food', spent: 420, limit: 500, color: '#F59E0B', period: 'monthly' },
    { id: '2', name: 'Transportation', category: 'transport', spent: 180, limit: 200, color: '#8B5CF6', period: 'monthly' },
    { id: '3', name: 'Entertainment', category: 'entertainment', spent: 95, limit: 150, color: '#EC4899', period: 'monthly' },
    { id: '4', name: 'Shopping', category: 'shopping', spent: 350, limit: 300, color: '#EF4444', period: 'monthly' },
    { id: '5', name: 'Utilities', category: 'utilities', spent: 145, limit: 200, color: '#10B981', period: 'monthly' },
    { id: '6', name: 'Healthcare', category: 'health', spent: 50, limit: 150, color: '#3B82F6', period: 'monthly' },
];

export default function Budgets() {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');

    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const getPercentage = (spent: number, limit: number) => {
        return Math.min((spent / limit) * 100, 100);
    };

    const isOverBudget = (spent: number, limit: number) => spent > limit;

    return (
        <>
            <Head>
                <title>Budgets | Finance Tracker</title>
                <meta name="description" content="Set and track your spending budgets" />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Budgets</h1>
                            <p className={styles.subtitle}>Set spending limits and track your progress</p>
                        </div>
                        <Button variant="primary" leftIcon={<PlusIcon />}>
                            Create Budget
                        </Button>
                    </div>

                    {/* Overview Card */}
                    <Card className={styles.overviewCard}>
                        <div className={styles.overviewGrid}>
                            <div className={styles.overviewItem}>
                                <span className={styles.overviewLabel}>Total Budget</span>
                                <span className={styles.overviewValue}>{formatCurrency(totalBudget)}</span>
                            </div>
                            <div className={styles.overviewItem}>
                                <span className={styles.overviewLabel}>Spent</span>
                                <span className={`${styles.overviewValue} ${styles.spent}`}>{formatCurrency(totalSpent)}</span>
                            </div>
                            <div className={styles.overviewItem}>
                                <span className={styles.overviewLabel}>Remaining</span>
                                <span className={`${styles.overviewValue} ${remaining >= 0 ? styles.positive : styles.negative}`}>
                                    {formatCurrency(remaining)}
                                </span>
                            </div>
                        </div>
                        <div className={styles.overviewProgress}>
                            <div className={styles.overviewProgressBar}>
                                <div
                                    className={styles.overviewProgressFill}
                                    style={{ width: `${getPercentage(totalSpent, totalBudget)}%` }}
                                />
                            </div>
                            <span className={styles.overviewPercentage}>
                                {Math.round(getPercentage(totalSpent, totalBudget))}% of budget used
                            </span>
                        </div>
                    </Card>

                    {/* Period Filter */}
                    <div className={styles.periodFilter}>
                        {['weekly', 'monthly', 'yearly'].map((period) => (
                            <button
                                key={period}
                                className={`${styles.periodButton} ${selectedPeriod === period ? styles.active : ''}`}
                                onClick={() => setSelectedPeriod(period)}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Budgets Grid */}
                    <div className={styles.budgetsGrid}>
                        {budgets.map((budget) => {
                            const percentage = getPercentage(budget.spent, budget.limit);
                            const over = isOverBudget(budget.spent, budget.limit);

                            return (
                                <Card key={budget.id} className={styles.budgetCard}>
                                    <div className={styles.budgetHeader}>
                                        <div
                                            className={styles.budgetDot}
                                            style={{ backgroundColor: budget.color }}
                                        />
                                        <h3 className={styles.budgetName}>{budget.name}</h3>
                                        {over && <span className={styles.overBadge}>Over Budget</span>}
                                    </div>

                                    <div className={styles.budgetAmounts}>
                                        <span className={over ? styles.negative : ''}>
                                            {formatCurrency(budget.spent)}
                                        </span>
                                        <span className={styles.budgetSeparator}>/</span>
                                        <span className={styles.budgetLimit}>{formatCurrency(budget.limit)}</span>
                                    </div>

                                    <div className={styles.budgetProgressBar}>
                                        <div
                                            className={`${styles.budgetProgress} ${over ? styles.danger : ''}`}
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: over ? 'var(--color-danger)' : budget.color,
                                            }}
                                        />
                                    </div>

                                    <div className={styles.budgetFooter}>
                                        {over ? (
                                            <span className={styles.overAmount}>
                                                Over by {formatCurrency(budget.spent - budget.limit)}
                                            </span>
                                        ) : (
                                            <span className={styles.remainingAmount}>
                                                {formatCurrency(budget.limit - budget.spent)} left
                                            </span>
                                        )}
                                        <span className={styles.budgetPercentage}>{Math.round(percentage)}%</span>
                                    </div>
                                </Card>
                            );
                        })}

                        {/* Add Budget Card */}
                        <Card className={styles.addBudgetCard} onClick={() => { }}>
                            <ChartBarIcon className={styles.addIcon} />
                            <span>Create New Budget</span>
                        </Card>
                    </div>
                </div>
            </Layout>
        </>
    );
}
