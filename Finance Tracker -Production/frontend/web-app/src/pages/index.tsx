import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Layout } from '../components/common';
import {
    SummaryCard,
    RecentTransactions,
    SpendingChart,
    BudgetOverview,
} from '../components/dashboard';
import { analyticsService } from '../services/analyticsService';
import { DashboardSummary } from '../types';
import styles from '../styles/Dashboard.module.css';

// Using a wallet icon as PiggyBankIcon doesn't exist
const SavingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
);

export default function Dashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await analyticsService.getSummary();
                setSummary(data);
            } catch (error) {
                console.error('Failed to fetch dashboard summary:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    return (
        <>
            <Head>
                <title>Dashboard | Finance Tracker</title>
                <meta name="description" content="Your personal finance dashboard - track income, expenses, and savings" />
            </Head>

            <Layout>
                <div className={styles.dashboard}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Dashboard</h1>
                            <p className={styles.subtitle}>Welcome back! Here&apos;s your financial overview.</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className={styles.summaryGrid}>
                        <SummaryCard
                            title="Total Balance"
                            value={isLoading ? '...' : formatCurrency(summary?.totalBalance || 0)}
                            change={12.5}
                            icon={<BanknotesIcon />}
                            variant="default"
                        />
                        <SummaryCard
                            title="Income"
                            value={isLoading ? '...' : formatCurrency(summary?.totalIncome || 0)}
                            change={8.2}
                            icon={<ArrowTrendingUpIcon />}
                            variant="income"
                        />
                        <SummaryCard
                            title="Expenses"
                            value={isLoading ? '...' : formatCurrency(summary?.totalExpenses || 0)}
                            change={-4.3}
                            icon={<ArrowTrendingDownIcon />}
                            variant="expense"
                        />
                        <SummaryCard
                            title="Savings Rate"
                            value={isLoading ? '...' : `${summary?.savingsRate || 0}%`}
                            change={15.8}
                            icon={<SavingsIcon />}
                            variant="savings"
                            changeLabel="of total income"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className={styles.mainGrid}>
                        <div className={styles.chartSection}>
                            <SpendingChart />
                        </div>
                        <div className={styles.sideSection}>
                            <BudgetOverview />
                        </div>
                    </div>

                    {/* Transactions Section */}
                    <div className={styles.transactionsSection}>
                        <RecentTransactions />
                    </div>
                </div>
            </Layout>
        </>
    );
}
