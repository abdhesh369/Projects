import React, { useState, useEffect } from 'react';
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
} from 'recharts';
import { Layout, Button, Card } from '../components/common';
import { analyticsService } from '../services/analyticsService';
import { DashboardSummary, CategoryBreakdown, ChartDataPoint } from '../types';
import styles from '../styles/Reports.module.css';

export default function Reports() {
    const [dateRange, setDateRange] = useState('6m');
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
    const [trend, setTrend] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const [summaryData, breakdownData, trendData] = await Promise.all([
                    analyticsService.getSummary(),
                    analyticsService.getCategoryBreakdown(),
                    analyticsService.getSpendingTrend(),
                ]);
                setSummary(summaryData);
                setCategories(breakdownData);
                setTrend(trendData);
            } catch (error) {
                console.error('Failed to fetch report data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportData();
    }, [dateRange]);

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
                            <span className={`${styles.statValue} ${styles.income}`}>{isLoading ? '...' : formatCurrency(summary?.totalIncome || 0)}</span>
                        </Card>
                        <Card className={styles.statCard}>
                            <span className={styles.statLabel}>Total Expenses</span>
                            <span className={`${styles.statValue} ${styles.expense}`}>{isLoading ? '...' : formatCurrency(summary?.totalExpenses || 0)}</span>
                        </Card>
                        <Card className={styles.statCard}>
                            <span className={styles.statLabel}>Net Savings</span>
                            <span className={`${styles.statValue} ${styles.savings}`}>{isLoading ? '...' : formatCurrency((summary?.totalIncome || 0) - (summary?.totalExpenses || 0))}</span>
                        </Card>
                        <Card className={styles.statCard}>
                            <span className={styles.statLabel}>Savings Rate</span>
                            <span className={`${styles.statValue} ${styles.savings}`}>{isLoading ? '...' : summary?.savingsRate}%</span>
                        </Card>
                    </div>

                    {/* Charts Grid */}
                    <div className={styles.chartsGrid}>
                        {/* Spending Trend Chart */}
                        <Card className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Spending Trend</h3>
                            <div className={styles.chartWrapper}>
                                {isLoading ? <p>Loading trend...</p> : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={trend}>
                                            <defs>
                                                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                            <Tooltip
                                                formatter={(value: any) => formatCurrency(Number(value))}
                                                contentStyle={{
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGradient)" name="Expenses" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>

                        {/* Spending by Category */}
                        <Card className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Spending by Category</h3>
                            <div className={styles.pieWrapper}>
                                {isLoading ? <p>Loading categories...</p> : (
                                    <>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={categories}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="amount"
                                                    nameKey="categoryName"
                                                >
                                                    {categories.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: any) => formatCurrency(Number(value))}
                                                    contentStyle={{
                                                        background: 'var(--bg-secondary)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className={styles.pieLegend}>
                                            {categories.map((cat) => (
                                                <div key={cat.categoryId} className={styles.legendItem}>
                                                    <span className={styles.legendDot} style={{ backgroundColor: cat.color }} />
                                                    <span className={styles.legendName}>{cat.categoryName}</span>
                                                    <span className={styles.legendValue}>{formatCurrency(cat.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </Layout>
        </>
    );
}
