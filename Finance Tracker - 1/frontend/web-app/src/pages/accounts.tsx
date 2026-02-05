import React, { useState } from 'react';
import Head from 'next/head';
import {
    PlusIcon,
    BanknotesIcon,
    CreditCardIcon,
    BuildingLibraryIcon,
    WalletIcon,
} from '@heroicons/react/24/outline';
import { Layout, Button, Card } from '../components/common';
import styles from '../styles/Accounts.module.css';

interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
    balance: number;
    institution: string;
    color: string;
    lastTransaction: string;
}

const accounts: Account[] = [
    { id: '1', name: 'Main Checking', type: 'checking', balance: 12450.50, institution: 'Chase Bank', color: '#6366F1', lastTransaction: '2026-02-04' },
    { id: '2', name: 'Savings Account', type: 'savings', balance: 8500.00, institution: 'Chase Bank', color: '#10B981', lastTransaction: '2026-02-01' },
    { id: '3', name: 'Credit Card', type: 'credit', balance: -1250.00, institution: 'American Express', color: '#F59E0B', lastTransaction: '2026-02-04' },
    { id: '4', name: 'Investment Portfolio', type: 'investment', balance: 25000.00, institution: 'Fidelity', color: '#8B5CF6', lastTransaction: '2026-01-28' },
    { id: '5', name: 'Cash Wallet', type: 'cash', balance: 350.00, institution: 'Personal', color: '#EC4899', lastTransaction: '2026-02-03' },
];

const accountIcons: Record<string, React.ReactNode> = {
    checking: <BanknotesIcon />,
    savings: <BuildingLibraryIcon />,
    credit: <CreditCardIcon />,
    investment: <WalletIcon />,
    cash: <WalletIcon />,
};

export default function Accounts() {
    const [selectedType, setSelectedType] = useState<string>('all');

    const filteredAccounts = selectedType === 'all'
        ? accounts
        : accounts.filter(a => a.type === selectedType);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAssets = accounts.filter(a => a.balance > 0).reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, acc) => sum + acc.balance, 0));

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <>
            <Head>
                <title>Accounts | Finance Tracker</title>
                <meta name="description" content="Manage your bank accounts and financial assets" />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Accounts</h1>
                            <p className={styles.subtitle}>Manage your bank accounts and financial assets</p>
                        </div>
                        <Button variant="primary" leftIcon={<PlusIcon />}>
                            Add Account
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className={styles.summaryGrid}>
                        <Card className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Net Worth</span>
                            <span className={`${styles.summaryValue} ${totalBalance >= 0 ? styles.positive : styles.negative}`}>
                                {formatCurrency(totalBalance)}
                            </span>
                        </Card>
                        <Card className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Total Assets</span>
                            <span className={`${styles.summaryValue} ${styles.positive}`}>
                                {formatCurrency(totalAssets)}
                            </span>
                        </Card>
                        <Card className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Total Liabilities</span>
                            <span className={`${styles.summaryValue} ${styles.negative}`}>
                                {formatCurrency(totalLiabilities)}
                            </span>
                        </Card>
                    </div>

                    {/* Filter Tabs */}
                    <div className={styles.filterTabs}>
                        {['all', 'checking', 'savings', 'credit', 'investment', 'cash'].map((type) => (
                            <button
                                key={type}
                                className={`${styles.filterTab} ${selectedType === type ? styles.active : ''}`}
                                onClick={() => setSelectedType(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Accounts Grid */}
                    <div className={styles.accountsGrid}>
                        {filteredAccounts.map((account) => (
                            <Card
                                key={account.id}
                                className={styles.accountCard}
                                onClick={() => { }}
                            >
                                <div className={styles.accountHeader}>
                                    <div
                                        className={styles.accountIcon}
                                        style={{ backgroundColor: `${account.color}20`, color: account.color }}
                                    >
                                        {accountIcons[account.type]}
                                    </div>
                                    <span
                                        className={styles.accountType}
                                        style={{ backgroundColor: `${account.color}20`, color: account.color }}
                                    >
                                        {account.type}
                                    </span>
                                </div>

                                <h3 className={styles.accountName}>{account.name}</h3>
                                <p className={styles.accountInstitution}>{account.institution}</p>

                                <div className={styles.accountBalance}>
                                    <span className={account.balance >= 0 ? styles.positive : styles.negative}>
                                        {formatCurrency(account.balance)}
                                    </span>
                                </div>

                                <div className={styles.accountFooter}>
                                    <span className={styles.lastTransaction}>
                                        Last transaction: {formatDate(account.lastTransaction)}
                                    </span>
                                </div>
                            </Card>
                        ))}

                        {/* Add Account Card */}
                        <Card className={styles.addAccountCard} onClick={() => { }}>
                            <PlusIcon className={styles.addIcon} />
                            <span>Add New Account</span>
                        </Card>
                    </div>
                </div>
            </Layout>
        </>
    );
}
