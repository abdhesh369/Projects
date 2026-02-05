import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ShoppingBagIcon,
    HomeIcon,
    TruckIcon,
    FilmIcon,
    BoltIcon,
    CurrencyDollarIcon,
    HeartIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Modal, Button, Input } from '../common';
import styles from './TransactionModal.module.css';

const transactionSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.string().min(1, 'Amount is required'),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, 'Category is required'),
    account: z.string().min(1, 'Account is required'),
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: TransactionFormData;
}

const categories = [
    { id: 'shopping', name: 'Shopping', icon: ShoppingBagIcon, color: '#F59E0B' },
    { id: 'housing', name: 'Housing', icon: HomeIcon, color: '#6366F1' },
    { id: 'transport', name: 'Transport', icon: TruckIcon, color: '#8B5CF6' },
    { id: 'entertainment', name: 'Entertainment', icon: FilmIcon, color: '#EC4899' },
    { id: 'utilities', name: 'Utilities', icon: BoltIcon, color: '#10B981' },
    { id: 'income', name: 'Income', icon: CurrencyDollarIcon, color: '#22C55E' },
    { id: 'health', name: 'Health', icon: HeartIcon, color: '#EF4444' },
    { id: 'education', name: 'Education', icon: AcademicCapIcon, color: '#14B8A6' },
];

const accounts = [
    { id: '1', name: 'Main Checking' },
    { id: '2', name: 'Savings Account' },
    { id: '3', name: 'Credit Card' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    transaction,
}) => {
    const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (data: TransactionFormData) => {
        console.log('Form data:', { ...data, category: selectedCategory });
        // TODO: API call to save transaction
        await new Promise((resolve) => setTimeout(resolve, 1000));
        reset();
        setSelectedCategory('');
        onClose();
    };

    const handleClose = () => {
        reset();
        setSelectedCategory('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Transaction" size="md">
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {/* Transaction Type Toggle */}
                <div className={styles.typeToggle}>
                    <button
                        type="button"
                        className={`${styles.typeButton} ${selectedType === 'expense' ? styles.expense : ''}`}
                        onClick={() => setSelectedType('expense')}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        className={`${styles.typeButton} ${selectedType === 'income' ? styles.income : ''}`}
                        onClick={() => setSelectedType('income')}
                    >
                        Income
                    </button>
                </div>
                <input type="hidden" {...register('type')} value={selectedType} />

                {/* Amount */}
                <div className={styles.amountWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={styles.amountInput}
                        {...register('amount')}
                    />
                </div>
                {errors.amount && <span className={styles.error}>{errors.amount.message}</span>}

                {/* Description */}
                <Input
                    label="Description"
                    placeholder="What was this transaction for?"
                    error={errors.description?.message}
                    {...register('description')}
                />

                {/* Category */}
                <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <div className={styles.categories}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                className={`${styles.categoryButton} ${selectedCategory === cat.id ? styles.selected : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    '--category-color': cat.color,
                                    '--category-bg': `${cat.color}20`,
                                } as React.CSSProperties}
                            >
                                <cat.icon className={styles.categoryIcon} />
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                    <input type="hidden" {...register('category')} value={selectedCategory} />
                    {errors.category && <span className={styles.error}>{errors.category.message}</span>}
                </div>

                {/* Account & Date */}
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>Account</label>
                        <select className={styles.select} {...register('account')}>
                            <option value="">Select account</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                        {errors.account && <span className={styles.error}>{errors.account.message}</span>}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Date</label>
                        <input
                            type="date"
                            className={styles.dateInput}
                            {...register('date')}
                        />
                        {errors.date && <span className={styles.error}>{errors.date.message}</span>}
                    </div>
                </div>

                {/* Notes */}
                <div className={styles.field}>
                    <label className={styles.label}>Notes (optional)</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Add any additional notes..."
                        rows={3}
                        {...register('notes')}
                    />
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        Save Transaction
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionModal;
