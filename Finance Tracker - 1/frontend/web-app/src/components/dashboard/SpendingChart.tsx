import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import styles from './SpendingChart.module.css';

interface ChartData {
    name: string;
    income: number;
    expenses: number;
}

// Demo data for the last 6 months
const data: ChartData[] = [
    { name: 'Sep', income: 4200, expenses: 2800 },
    { name: 'Oct', income: 4500, expenses: 3100 },
    { name: 'Nov', income: 4300, expenses: 2700 },
    { name: 'Dec', income: 5200, expenses: 4200 },
    { name: 'Jan', income: 4800, expenses: 3400 },
    { name: 'Feb', income: 4500, expenses: 2900 },
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
                        {entry.name}: ${entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const SpendingChart: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Income vs Expenses</h3>
                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.income}`} />
                        <span>Income</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.expenses}`} />
                        <span>Expenses</span>
                    </div>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148, 163, 184, 0.1)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="url(#incomeGradient)"
                            name="Income"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#6366F1"
                            strokeWidth={2}
                            fill="url(#expenseGradient)"
                            name="Expenses"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SpendingChart;
