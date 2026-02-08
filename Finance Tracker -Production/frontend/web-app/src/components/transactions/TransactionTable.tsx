import React, { useState } from 'react';
import {
    ChevronUpIcon,
    ChevronDownIcon,
    PencilSquareIcon,
    TrashIcon,
    EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import {
    ShoppingBagIcon,
    HomeIcon,
    TruckIcon,
    FilmIcon,
    BoltIcon,
    CurrencyDollarIcon,
    BuildingOfficeIcon,
    HeartIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline';
import styles from './TransactionTable.module.css';

interface Transaction {
    id: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    account: string;
}

interface TransactionTableProps {
    searchQuery: string;
    typeFilter: 'all' | 'income' | 'expense';
}

// Demo data
const allTransactions: Transaction[] = [
    { id: '1', description: 'Salary Deposit', category: 'income', amount: 4500.00, type: 'income', date: '2026-02-03', account: 'Main Checking' },
    { id: '2', description: 'Grocery Shopping', category: 'shopping', amount: 85.50, type: 'expense', date: '2026-02-04', account: 'Credit Card' },
    { id: '3', description: 'Electric Bill', category: 'utilities', amount: 120.00, type: 'expense', date: '2026-02-02', account: 'Main Checking' },
    { id: '4', description: 'Netflix Subscription', category: 'entertainment', amount: 15.99, type: 'expense', date: '2026-02-01', account: 'Credit Card' },
    { id: '5', description: 'Rent Payment', category: 'housing', amount: 1200.00, type: 'expense', date: '2026-02-01', account: 'Main Checking' },
    { id: '6', description: 'Freelance Work', category: 'income', amount: 850.00, type: 'income', date: '2026-01-30', account: 'Main Checking' },
    { id: '7', description: 'Gas Station', category: 'transport', amount: 55.00, type: 'expense', date: '2026-01-29', account: 'Credit Card' },
    { id: '8', description: 'Restaurant', category: 'shopping', amount: 65.00, type: 'expense', date: '2026-01-28', account: 'Credit Card' },
    { id: '9', description: 'Gym Membership', category: 'health', amount: 50.00, type: 'expense', date: '2026-01-27', account: 'Main Checking' },
    { id: '10', description: 'Online Course', category: 'education', amount: 199.00, type: 'expense', date: '2026-01-26', account: 'Credit Card' },
];

const categoryIcons: Record<string, React.ReactNode> = {
    shopping: <ShoppingBagIcon />,
    housing: <HomeIcon />,
    transport: <TruckIcon />,
    entertainment: <FilmIcon />,
    utilities: <BoltIcon />,
    income: <CurrencyDollarIcon />,
    work: <BuildingOfficeIcon />,
    health: <HeartIcon />,
    education: <AcademicCapIcon />,
};

const categoryColors: Record<string, string> = {
    shopping: '#F59E0B',
    housing: '#6366F1',
    transport: '#8B5CF6',
    entertainment: '#EC4899',
    utilities: '#10B981',
    income: '#22C55E',
    work: '#3B82F6',
    health: '#EF4444',
    education: '#14B8A6',
};

type SortField = 'date' | 'description' | 'category' | 'amount';
type SortDirection = 'asc' | 'desc';

export const TransactionTable: React.FC<TransactionTableProps> = ({
    searchQuery,
    typeFilter
}) => {
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredTransactions = allTransactions
        .filter((t) => {
            if (typeFilter !== 'all' && t.type !== typeFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    t.description.toLowerCase().includes(query) ||
                    t.category.toLowerCase().includes(query) ||
                    t.account.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'description':
                    comparison = a.description.localeCompare(b.description);
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

    const formatAmount = (amount: number, type: 'income' | 'expense') => {
        const formatted = amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return type === 'income' ? `+${formatted}` : `-${formatted}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const toggleRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAll = () => {
        if (selectedRows.size === filteredTransactions.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(filteredTransactions.map(t => t.id)));
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? (
            <ChevronUpIcon className={styles.sortIcon} />
        ) : (
            <ChevronDownIcon className={styles.sortIcon} />
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.size === filteredTransactions.length && filteredTransactions.length > 0}
                                    onChange={toggleAll}
                                    className={styles.checkbox}
                                />
                            </th>
                            <th onClick={() => handleSort('date')} className={styles.sortable}>
                                Date <SortIcon field="date" />
                            </th>
                            <th onClick={() => handleSort('description')} className={styles.sortable}>
                                Description <SortIcon field="description" />
                            </th>
                            <th onClick={() => handleSort('category')} className={styles.sortable}>
                                Category <SortIcon field="category" />
                            </th>
                            <th>Account</th>
                            <th onClick={() => handleSort('amount')} className={`${styles.sortable} ${styles.amountHeader}`}>
                                Amount <SortIcon field="amount" />
                            </th>
                            <th className={styles.actionsHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((transaction) => (
                            <tr
                                key={transaction.id}
                                className={selectedRows.has(transaction.id) ? styles.selected : ''}
                            >
                                <td className={styles.checkboxCell}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(transaction.id)}
                                        onChange={() => toggleRow(transaction.id)}
                                        className={styles.checkbox}
                                    />
                                </td>
                                <td className={styles.dateCell}>{formatDate(transaction.date)}</td>
                                <td className={styles.descriptionCell}>{transaction.description}</td>
                                <td>
                                    <div className={styles.category}>
                                        <span
                                            className={styles.categoryIcon}
                                            style={{ backgroundColor: `${categoryColors[transaction.category]}20`, color: categoryColors[transaction.category] }}
                                        >
                                            {categoryIcons[transaction.category]}
                                        </span>
                                        <span className={styles.categoryName}>
                                            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                                        </span>
                                    </div>
                                </td>
                                <td className={styles.accountCell}>{transaction.account}</td>
                                <td className={`${styles.amountCell} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
                                    {formatAmount(transaction.amount, transaction.type)}
                                </td>
                                <td className={styles.actionsCell}>
                                    <button className={styles.actionButton} title="Edit">
                                        <PencilSquareIcon />
                                    </button>
                                    <button className={styles.actionButton} title="Delete">
                                        <TrashIcon />
                                    </button>
                                    <button className={styles.actionButton} title="More">
                                        <EllipsisVerticalIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredTransactions.length === 0 && (
                <div className={styles.emptyState}>
                    <p>No transactions found</p>
                </div>
            )}

            {/* Pagination */}
            <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                    Showing {filteredTransactions.length} of {allTransactions.length} transactions
                </span>
                <div className={styles.paginationButtons}>
                    <button className={styles.paginationButton} disabled>Previous</button>
                    <button className={`${styles.paginationButton} ${styles.active}`}>1</button>
                    <button className={styles.paginationButton}>2</button>
                    <button className={styles.paginationButton}>3</button>
                    <button className={styles.paginationButton}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default TransactionTable;
