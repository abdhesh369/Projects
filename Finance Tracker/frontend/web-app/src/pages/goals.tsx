import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
    PlusIcon,
    FlagIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    TagIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Layout, Button, Card, Modal, Input } from '../components/common';
import api from '../services/api';
import styles from '../styles/Goals.module.css';

interface Goal {
    id: string;
    user_id: string;
    name: string;
    description: string;
    target_amount: number;
    current_amount: number;
    currency: string;
    target_date: string;
    category: string;
    status: 'active' | 'completed' | 'paused';
    created_at: string;
    updated_at: string;
}

export default function Goals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddingSavings, setIsAddingSavings] = useState<{ [key: string]: boolean }>({});
    const [savingsAmount, setSavingsAmount] = useState<{ [key: string]: string }>({});

    const [isCreating, setIsCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({
        name: '',
        target_amount: '',
        currency: 'USD',
        target_date: '',
        category: 'other',
        description: ''
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/goals');
            setGoals(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching goals:', err);
            setError('Failed to load goals. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await api.post('/api/goals', {
                ...newGoal,
                target_amount: parseFloat(newGoal.target_amount)
            });
            setIsModalOpen(false);
            setNewGoal({
                name: '',
                target_amount: '',
                currency: 'USD',
                target_date: '',
                category: 'other',
                description: ''
            });
            fetchGoals();
        } catch (err) {
            console.error('Error creating goal:', err);
            alert('Failed to create goal. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleAddSavings = async (goalId: string) => {
        const amount = parseFloat(savingsAmount[goalId]);
        if (isNaN(amount) || amount <= 0) return;

        try {
            await api.post(`/api/goals/${goalId}/contribute`, { amount });
            setSavingsAmount({ ...savingsAmount, [goalId]: '' });
            setIsAddingSavings({ ...isAddingSavings, [goalId]: false });
            fetchGoals(); // Refresh goals
        } catch (err) {
            console.error('Error adding savings:', err);
            alert('Failed to add savings. Please try again.');
        }
    };

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const totalTarget = activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);

    const formatCurrency = (amount: number, currency = 'USD') => {
        return Number(amount).toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const getPercentage = (current: number, target: number) => {
        return Math.min((Number(current) / Number(target)) * 100, 100);
    };

    const getDaysRemaining = (deadline: string) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) return 'Overdue';
        if (diff === 0) return 'Due today';
        if (diff === 1) return '1 day left';
        if (diff < 30) return `${diff} days left`;
        if (diff < 365) return `${Math.round(diff / 30)} months left`;
        return `${Math.round(diff / 365)} years left`;
    };

    const getCategoryEmoji = (category: string) => {
        const categories: { [key: string]: string } = {
            'emergency': '🛡️',
            'vacation': '✈️',
            'electronics': '💻',
            'vehicle': '🚗',
            'home': '🏠',
            'education': '🎓',
            'other': '🎯'
        };
        return categories[category.toLowerCase()] || '🎯';
    };

    const getGoalColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'emergency': '#10B981',
            'vacation': '#6366F1',
            'electronics': '#8B5CF6',
            'vehicle': '#F59E0B',
            'home': '#EC4899',
            'education': '#3B82F6',
            'other': '#6B7280'
        };
        return colors[category.toLowerCase()] || '#6366F1';
    };

    return (
        <>
            <Head>
                <title>Goals | Finance Tracker</title>
                <meta name="description" content="Set and track your financial goals" />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Financial Goals</h1>
                            <p className={styles.subtitle}>Track your savings goals and milestones</p>
                        </div>
                        <Button
                            variant="primary"
                            leftIcon={<PlusIcon />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Create Goal
                        </Button>
                    </div>

                    {/* Overview */}
                    <div className={styles.overviewGrid}>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)' }}>
                                <FlagIcon />
                            </div>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Active Goals</span>
                                <span className={styles.overviewValue}>{activeGoals.length}</span>
                            </div>
                        </Card>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                                <CheckCircleIcon />
                            </div>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Completed</span>
                                <span className={styles.overviewValue}>{completedGoals.length}</span>
                            </div>
                        </Card>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Total Target</span>
                                <span className={styles.overviewValue}>{formatCurrency(totalTarget)}</span>
                            </div>
                        </Card>
                        <Card className={styles.overviewCard}>
                            <div className={styles.overviewContent}>
                                <span className={styles.overviewLabel}>Total Saved</span>
                                <span className={`${styles.overviewValue} ${styles.positive}`}>{formatCurrency(totalSaved)}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Active Goals */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Active Goals</h2>
                            {isLoading && <span className={styles.loadingText}>Refreshing...</span>}
                        </div>

                        {error && (
                            <div className={styles.errorAlert}>
                                {error}
                                <button onClick={fetchGoals} className={styles.retryButton}>Retry</button>
                            </div>
                        )}

                        {!isLoading && activeGoals.length === 0 && (
                            <div className={styles.emptyState}>
                                <FlagIcon className={styles.emptyIcon} />
                                <p>No active goals found. Start by creating one!</p>
                            </div>
                        )}

                        <div className={styles.goalsGrid}>
                            {activeGoals.map((goal) => {
                                const percentage = getPercentage(goal.current_amount, goal.target_amount);
                                const color = getGoalColor(goal.category);

                                return (
                                    <Card key={goal.id} className={styles.goalCard}>
                                        <div className={styles.goalHeader}>
                                            <span className={styles.goalEmoji}>{getCategoryEmoji(goal.category)}</span>
                                            <div className={styles.goalInfo}>
                                                <h3 className={styles.goalName}>{goal.name}</h3>
                                                <p className={styles.goalDescription}>{goal.description}</p>
                                            </div>
                                        </div>

                                        <div className={styles.goalProgress}>
                                            <div className={styles.goalProgressBar}>
                                                <div
                                                    className={styles.goalProgressFill}
                                                    style={{ width: `${percentage}%`, backgroundColor: color }}
                                                />
                                            </div>
                                            <div className={styles.goalProgressInfo}>
                                                <span>{Math.round(percentage)}%</span>
                                                <span className={styles.goalDeadline}>{getDaysRemaining(goal.target_date)}</span>
                                            </div>
                                        </div>

                                        <div className={styles.goalAmounts}>
                                            <div className={styles.goalAmount}>
                                                <span className={styles.goalAmountLabel}>Saved</span>
                                                <span className={styles.goalAmountValue} style={{ color }}>
                                                    {formatCurrency(goal.current_amount, goal.currency)}
                                                </span>
                                            </div>
                                            <div className={styles.goalAmount}>
                                                <span className={styles.goalAmountLabel}>Target</span>
                                                <span className={styles.goalAmountValue}>
                                                    {formatCurrency(goal.target_amount, goal.currency)}
                                                </span>
                                            </div>
                                            <div className={styles.goalAmount}>
                                                <span className={styles.goalAmountLabel}>Remaining</span>
                                                <span className={styles.goalAmountValue}>
                                                    {formatCurrency(goal.target_amount - goal.current_amount, goal.currency)}
                                                </span>
                                            </div>
                                        </div>

                                        {isAddingSavings[goal.id] ? (
                                            <div className={styles.addSavingsContainer}>
                                                <input
                                                    type="number"
                                                    className={styles.amountInput}
                                                    placeholder="0.00"
                                                    value={savingsAmount[goal.id] || ''}
                                                    onChange={(e) => setSavingsAmount({ ...savingsAmount, [goal.id]: e.target.value })}
                                                    autoFocus
                                                />
                                                <div className={styles.addSavingsActions}>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleAddSavings(goal.id)}
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setIsAddingSavings({ ...isAddingSavings, [goal.id]: false })}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => setIsAddingSavings({ ...isAddingSavings, [goal.id]: true })}
                                            >
                                                Add Savings
                                            </Button>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Completed Goals */}
                    {completedGoals.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Completed Goals 🎉</h2>
                            <div className={styles.completedGrid}>
                                {completedGoals.map((goal) => (
                                    <Card key={goal.id} className={styles.completedCard}>
                                        <span className={styles.goalEmoji}>{getCategoryEmoji(goal.category)}</span>
                                        <div className={styles.completedInfo}>
                                            <h3 className={styles.completedName}>{goal.name}</h3>
                                            <span className={styles.completedAmount}>{formatCurrency(goal.target_amount, goal.currency)}</span>
                                        </div>
                                        <CheckCircleIcon className={styles.completedCheck} />
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Create Goal Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Create New Financial Goal"
                    size="md"
                >
                    <form onSubmit={handleCreateGoal} className={styles.createGoalForm}>
                        <Input
                            label="Goal Name"
                            placeholder="e.g., Emergency Fund"
                            value={newGoal.name}
                            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                            required
                            leftIcon={<FlagIcon className="w-5 h-5" />}
                        />

                        <div className={styles.formRow}>
                            <Input
                                label="Target Amount"
                                type="number"
                                placeholder="0.00"
                                value={newGoal.target_amount}
                                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                                required
                                leftIcon={<CurrencyDollarIcon className="w-5 h-5" />}
                            />
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Currency</label>
                                <select
                                    className={styles.select}
                                    value={newGoal.currency}
                                    onChange={(e) => setNewGoal({ ...newGoal, currency: e.target.value })}
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <Input
                                label="Target Date"
                                type="date"
                                value={newGoal.target_date}
                                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                                required
                                leftIcon={<CalendarIcon className="w-5 h-5" />}
                            />
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select
                                    className={styles.select}
                                    value={newGoal.category}
                                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                                >
                                    <option value="emergency">Emergency</option>
                                    <option value="vacation">Vacation</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="home">Home</option>
                                    <option value="education">Education</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description (Optional)</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Describe your goal..."
                                value={newGoal.description}
                                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isCreating}
                            >
                                Create Goal
                            </Button>
                        </div>
                    </form>
                </Modal>
            </Layout>
        </>
    );
}
