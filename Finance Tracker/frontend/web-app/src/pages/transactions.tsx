import React, { useState } from 'react';
import Head from 'next/head';
import {
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { Layout, Button, Input, Card } from '../components/common';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionModal } from '../components/transactions/TransactionModal';
import styles from '../styles/Transactions.module.css';

export default function Transactions() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');

    return (
        <>
            <Head>
                <title>Transactions | Finance Tracker</title>
                <meta name="description" content="View and manage all your financial transactions" />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Transactions</h1>
                            <p className={styles.subtitle}>Track and manage all your financial transactions</p>
                        </div>
                        <div className={styles.headerActions}>
                            <Button
                                variant="secondary"
                                leftIcon={<ArrowDownTrayIcon />}
                            >
                                Export
                            </Button>
                            <Button
                                variant="primary"
                                leftIcon={<PlusIcon />}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Add Transaction
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className={styles.filtersCard} padding="md" hover={false}>
                        <div className={styles.filters}>
                            <div className={styles.searchWrapper}>
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    leftIcon={<MagnifyingGlassIcon />}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <div className={styles.typeFilter}>
                                    <button
                                        className={`${styles.typeButton} ${selectedType === 'all' ? styles.active : ''}`}
                                        onClick={() => setSelectedType('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`${styles.typeButton} ${selectedType === 'income' ? styles.active : ''}`}
                                        onClick={() => setSelectedType('income')}
                                    >
                                        Income
                                    </button>
                                    <button
                                        className={`${styles.typeButton} ${selectedType === 'expense' ? styles.active : ''}`}
                                        onClick={() => setSelectedType('expense')}
                                    >
                                        Expenses
                                    </button>
                                </div>

                                <Button variant="ghost" leftIcon={<FunnelIcon />}>
                                    More Filters
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Transaction Table */}
                    <Card className={styles.tableCard} padding="none" hover={false}>
                        <TransactionTable searchQuery={searchQuery} typeFilter={selectedType} />
                    </Card>
                </div>

                {/* Add/Edit Modal */}
                <TransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </Layout>
        </>
    );
}
