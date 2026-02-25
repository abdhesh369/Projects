import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
    PlusIcon,
    BanknotesIcon,
    CreditCardIcon,
    BuildingLibraryIcon,
    WalletIcon,
} from '@heroicons/react/24/outline';
import { Layout, Button, Card, PlaidLinkButton } from '../components/common';
import { accountService } from '../services/accountService';
import { Account } from '../types';
import styles from '../styles/Accounts.module.css';

const accountIcons: Record<string, React.ReactNode> = {
    checking: <BanknotesIcon />,
    savings: <BuildingLibraryIcon />,
    credit: <CreditCardIcon />,
    investment: <WalletIcon />,
    cash: <WalletIcon />,
};

export default function Accounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    const fetchAccounts = async () => {
        try {
            const data = await accountService.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

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
                        <PlaidLinkButton onSuccessCallback={fetchAccounts} />
                    </div>

                    {/* Summary Cards */}
                    <div className={styles.summaryGrid}>
                        <Card className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Net Worth</span>
                            <span className={`${styles.summaryValue} ${totalBalance >= 0 ? styles.positive : styles.negative}`}>
                                {isLoading ? '...' : formatCurrency(totalBalance)}
                            </span>
                        </Card>
                        <Card className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Total Assets</span>
                            <span className={`${styles.summaryValue} ${styles.positive}`}>
                                {isLoading ? '...' : formatCurrency(totalAssets)}
                            </span>
                        </Card>
                        <Card className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Total Liabilities</span>
                            <span className={`${styles.summaryValue} ${styles.negative}`}>
                                {isLoading ? '...' : formatCurrency(totalLiabilities)}
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
                        {isLoading ? (
                            <p>Loading accounts...</p>
                        ) : filteredAccounts.length > 0 ? (
                            filteredAccounts.map((account) => (
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
                                            Created: {formatDate(account.createdAt)}
                                        </span>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <p>No accounts found.</p>
                        )}

                        {/* Add Account Card */}
                        {!isLoading && (
                            <div className={styles.addAccountWrapper}>
                                <PlaidLinkButton onSuccessCallback={fetchAccounts} />
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
}
