import React from 'react';
import Head from 'next/head';
import {
    PlusIcon,
    FlagIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Layout, Button, Card } from '../components/common';
import styles from '../styles/Goals.module.css';

interface Goal {
    id: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    color: string;
    icon: string;
    status: 'active' | 'completed' | 'paused';
}

const goals: Goal[] = [
    { id: '1', name: 'Emergency Fund', description: '6 months of expenses', targetAmount: 15000, currentAmount: 8500, deadline: '2026-12-31', color: '#10B981', icon: '🛡️', status: 'active' },
    { id: '2', name: 'Vacation Trip', description: 'Summer vacation to Europe', targetAmount: 5000, currentAmount: 3200, deadline: '2026-06-01', color: '#6366F1', icon: '✈️', status: 'active' },
    { id: '3', name: 'New Laptop', description: 'MacBook Pro for work', targetAmount: 2500, currentAmount: 2500, deadline: '2026-01-15', color: '#8B5CF6', icon: '💻', status: 'completed' },
    { id: '4', name: 'Car Down Payment', description: 'Down payment for new car', targetAmount: 8000, currentAmount: 4500, deadline: '2026-09-01', color: '#F59E0B', icon: '🚗', status: 'active' },
    { id: '5', name: 'Home Renovation', description: 'Kitchen and bathroom updates', targetAmount: 20000, currentAmount: 5000, deadline: '2027-06-01', color: '#EC4899', icon: '🏠', status: 'active' },
];

export default function Goals() {
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const getPercentage = (current: number, target: number) => {
        return Math.min((current / target) * 100, 100);
    };

    const getDaysRemaining = (deadline: string) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) return 'Overdue';
        if (diff === 0) return 'Due today';
        if (diff === 1) return '1 day left';
        if (diff < 30) return `${diff} days left`;
        if (diff < 365) return `${Math.round(diff / 30)} months left`;
        return `${Math.round(diff / 365)} years left`;
    };

    return (
        <>
            <Head>
                <title>Goals | Finance Tracker</title>
                <meta name="description" content="Set and track your financial goals" />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Financial Goals</h1>
                            <p className={styles.subtitle}>Track your savings goals and milestones</p>
                        </div>
                        <Button variant="primary" leftIcon={<PlusIcon />}>
                            Create Goal
                        </Button>
                    </div>

                    {/* Overview */}
                    <div className={styles.overviewGrid}>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)' }}>
                                <FlagIcon />
                            </div>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Active Goals</span>
                                <span className={styles.overviewValue}>{activeGoals.length}</span>
                            </div>
                        </Card>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                                <CheckCircleIcon />
                            </div>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Completed</span>
                                <span className={styles.overviewValue}>{completedGoals.length}</span>
                            </div>
                        </Card>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Total Target</span>
                                <span className={styles.overviewValue}>{formatCurrency(totalTarget)}</span>
                            </div>
                        </Card>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Total Saved</span>
                                <span className={`${styles.overviewValue} ${styles.positive}`}>{formatCurrency(totalSaved)}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Active Goals */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Active Goals</h2>
                        <div className={styles.goalsGrid}>
                            {activeGoals.map((goal) => {
                                const percentage = getPercentage(goal.currentAmount, goal.targetAmount);

                                return (
                                    <Card key={goal.id} className={styles.goalCard}>
                                        <div className={styles.goalHeader}>
                                            <span className={styles.goalEmoji}>{goal.icon}</span>
                                            <div className={styles.goalInfo}>
                                                <h3 className={styles.goalName}>{goal.name}</h3>
                                                <p className={styles.goalDescription}>{goal.description}</p>
                                            </div>
                                        </div>

                                        <div className={styles.goalProgress}>
                                            <div className={styles.goalProgressBar}>
                                                <div
                                                    className={styles.goalProgressFill}
                                                    style={{ width: `${percentage}%`, backgroundColor: goal.color }}
                                                />
                                            </div>
                                            <div className={styles.goalProgressInfo}>
                                                <span>{Math.round(percentage)}%</span>
                                                <span className={styles.goalDeadline}>{getDaysRemaining(goal.deadline)}</span>
                                            </div>
                                        </div>

                                        <div className={styles.goalAmounts}>
                                            <div className={styles.goalAmount}>
                                                <span className={styles.goalAmountLabel}>Saved</span>
                                                <span className={styles.goalAmountValue} style={{ color: goal.color }}>
                                                    {formatCurrency(goal.currentAmount)}
                                                </span>
                                            </div>
                                            <div className={styles.goalAmount}>
                                                <span className={styles.goalAmountLabel}>Target</span>
                                                <span className={styles.goalAmountValue}>
                                                    {formatCurrency(goal.targetAmount)}
                                                </span>
                                            </div>
                                            <div className={styles.goalAmount}>
                                                <span className={styles.goalAmountLabel}>Remaining</span>
                                                <span className={styles.goalAmountValue}>
                                                    {formatCurrency(goal.targetAmount - goal.currentAmount)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button variant="secondary" fullWidth>
                                            Add Savings
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Completed Goals */}
                    {completedGoals.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Completed Goals 🎉</h2>
                            <div className={styles.completedGrid}>
                                {completedGoals.map((goal) => (
                                    <Card key={goal.id} className={styles.completedCard}>
                                        <span className={styles.goalEmoji}>{goal.icon}</span>
                                        <div className={styles.completedInfo}>
                                            <h3 className={styles.completedName}>{goal.name}</h3>
                                            <span className={styles.completedAmount}>{formatCurrency(goal.targetAmount)}</span>
                                        </div>
                                        <CheckCircleIcon className={styles.completedCheck} />
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </Layout>
        </>
    );
}
