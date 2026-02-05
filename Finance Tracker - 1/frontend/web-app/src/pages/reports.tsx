import React, { useState } from 'react';
import Head from 'next/head';
import {
    ArrowDownTrayIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import { Layout, Button, Card } from '../components/common';
import styles from '../styles/Reports.module.css';

// Chart data
const monthlyData = [
    { month: 'Sep', income: 4200, expenses: 2800 },
    { month: 'Oct', income: 4500, expenses: 3100 },
    { month: 'Nov', income: 4300, expenses: 2700 },
    { month: 'Dec', income: 5200, expenses: 4200 },
    { month: 'Jan', income: 4800, expenses: 3400 },
    { month: 'Feb', income: 4500, expenses: 2900 },
];

const categoryData = [
    { name: 'Food & Dining', value: 420, color: '#F59E0B' },
    { name: 'Housing', value: 1200, color: '#6366F1' },
    { name: 'Transportation', value: 180, color: '#8B5CF6' },
    { name: 'Entertainment', value: 95, color: '#EC4899' },
    { name: 'Utilities', value: 145, color: '#10B981' },
    { name: 'Shopping', value: 350, color: '#EF4444' },
    { name: 'Other', value: 200, color: '#64748B' },
];

const weeklyData = [
    { day: 'Mon', amount: 120 },
    { day: 'Tue', amount: 85 },
    { day: 'Wed', amount: 200 },
    { day: 'Thu', amount: 50 },
    { day: 'Fri', amount: 180 },
    { day: 'Sat', amount: 320 },
    { day: 'Sun', amount: 95 },
];

export default function Reports() {
    const [dateRange, setDateRange] = useState('6m');

    const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
    const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = ((totalSavings / totalIncome) * 100).toFixed(1);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    return (
        <>
            <Head>
                <title>Reports | Finance Tracker</title>
                <meta name="description" content="View detailed financial reports and analytics" />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Reports & Analytics</h1>
                            <p className={styles.subtitle}>Get insights into your financial health</p>
                        </div>
                        <div className={styles.headerActions}>
                            <div className={styles.dateRangeSelect}>
                                <CalendarIcon className={styles.calendarIcon} />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className={styles.selectInput}
                                >
                                    <option value="1m">Last 30 days</option>
                                    <option value="3m">Last 3 months</option>
                                    <option value="6m">Last 6 months</option>
                                    <option value="1y">Last year</option>
                                </select>
                            </div>
                            <Button variant="secondary" leftIcon={<ArrowDownTrayIcon />}>
                                Export Report
                            </Button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className={styles.statsGrid}>
                        <Card className={styles.statCard}>
                            <span className={styles.statLabel}>Total Income</span>
                            <span className={`${styles.statValue} ${styles.income}`}>{formatCurrency(totalIncome)}</span>
                        </Card>
                        <Card className={styles.statCard}>
                            <span className={styles.statLabel}>Total Expenses</span>
                            <span className={`${styles.statValue} ${styles.expense}`}>{formatCurrency(totalExpenses)}</span>
                        </Card>
                        <Card className={styles.statCard}>
                            <span className={styles.statLabel}>Net Savings</span>
                            <span className={`${styles.statValue} ${styles.savings}`}>{formatCurrency(totalSavings)}</span>
                        </Card>
                        <Card className={styles.statCard}>
                            <span className={styles.statLabel}>Savings Rate</span>
                            <span className={`${styles.statValue} ${styles.savings}`}>{savingsRate}%</span>
                        </Card>
                    </div>

                    {/* Charts Grid */}
                    <div className={styles.chartsGrid}>
                        {/* Income vs Expenses Chart */}
                        <Card className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Income vs Expenses</h3>
                            <div className={styles.chartWrapper}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGradient)" name="Income" />
                                        <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGradient)" name="Expenses" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Spending by Category */}
                        <Card className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Spending by Category</h3>
                            <div className={styles.pieWrapper}>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className={styles.pieLegend}>
                                    {categoryData.map((cat) => (
                                        <div key={cat.name} className={styles.legendItem}>
                                            <span className={styles.legendDot} style={{ backgroundColor: cat.color }} />
                                            <span className={styles.legendName}>{cat.name}</span>
                                            <span className={styles.legendValue}>{formatCurrency(cat.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Weekly Spending */}
                        <Card className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Weekly Spending Pattern</h3>
                            <div className={styles.chartWrapper}>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} name="Spending" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </div>
            </Layout>
        </>
    );
}
