import React from 'react';
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import styles from './SummaryCard.module.css';

interface SummaryCardProps {
    title: string;
    value: string;
    change?: number;
    changeLabel?: string;
    icon: React.ReactNode;
    variant?: 'default' | 'income' | 'expense' | 'savings';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    change,
    changeLabel = 'vs last month',
    icon,
    variant = 'default',
}) => {
    const isPositive = change && change >= 0;

    return (
        <div className={`${styles.card} ${styles[variant]}`}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                <div className={styles.iconWrapper}>{icon}</div>
            </div>

            <div className={styles.value}>{value}</div>

            {typeof change !== 'undefined' && (
                <div className={styles.changeWrapper}>
                    <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                        {isPositive ? (
                            <ArrowTrendingUpIcon className={styles.changeIcon} />
                        ) : (
                            <ArrowTrendingDownIcon className={styles.changeIcon} />
                        )}
                        {isPositive ? '+' : ''}{change.toFixed(1)}%
                    </span>
                    <span className={styles.changeLabel}>{changeLabel}</span>
                </div>
            )}
        </div>
    );
};

export default SummaryCard;
