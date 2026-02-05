// ===== User Types =====
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    currency: string;
    theme: 'dark' | 'light';
    notifications: boolean;
}

// ===== Account Types =====
export interface Account {
    id: string;
    userId: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    institution?: string;
    color: string;
    icon: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'loan';

// ===== Transaction Types =====
export interface Transaction {
    id: string;
    userId: string;
    accountId: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    description: string;
    date: string;
    notes?: string;
    isRecurring: boolean;
    recurringDetails?: RecurringDetails;
    createdAt: string;
    updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface RecurringDetails {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate?: string;
}

// ===== Category Types =====
export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
    isDefault: boolean;
}

// ===== Budget Types =====
export interface Budget {
    id: string;
    userId: string;
    categoryId: string;
    name: string;
    amount: number;
    spent: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

// ===== Goal Types =====
export interface Goal {
    id: string;
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    icon: string;
    color: string;
    status: GoalStatus;
    createdAt: string;
}

export type GoalStatus = 'active' | 'completed' | 'paused';

// ===== API Response Types =====
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ===== Dashboard Summary Types =====
export interface DashboardSummary {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
    balanceChange: number;
    incomeChange: number;
    expenseChange: number;
}

// ===== Chart Data Types =====
export interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
}

export interface CategoryBreakdown {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
    color: string;
}

// ===== Form Types =====
export interface TransactionFormData {
    accountId: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    description: string;
    date: string;
    notes?: string;
    isRecurring: boolean;
    recurringDetails?: RecurringDetails;
}

export interface AccountFormData {
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    institution?: string;
    color: string;
}

export interface BudgetFormData {
    categoryId: string;
    name: string;
    amount: number;
    period: BudgetPeriod;
    startDate: string;
}

export interface GoalFormData {
    name: string;
    description?: string;
    targetAmount: number;
    deadline: string;
    icon: string;
    color: string;
}

// ===== Auth Types =====
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
