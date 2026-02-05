import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { ChartDataPoint } from '../../types';
import styles from './SpendingChart.module.css';

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
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrend = async () => {
            try {
                const trend = await analyticsService.getSpendingTrend();
                setData(trend);
            } catch (error) {
                console.error('Failed to fetch spending trend:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrend();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Spending Trend</h3>
                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.expenses}`} />
                        <span>Expenses</span>
                    </div>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                {isLoading ? (
                    <p>Loading chart...</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
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
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                dy={10}
                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                                dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#6366F1"
                                strokeWidth={2}
                                fill="url(#expenseGradient)"
                                name="Expenses"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default SpendingChart;
