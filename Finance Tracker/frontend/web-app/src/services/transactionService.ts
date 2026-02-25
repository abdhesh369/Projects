import api from './api';
import { Transaction, PaginatedResponse } from '../types';

interface TransactionFilters {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const transactionService = {
    getRecentTransactions: async (limit: number = 5): Promise<Transaction[]> => {
        try {
            const response = await api.get<Transaction[]>('/api/transactions/recent', { params: { limit } });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch recent transactions:', error);
            return [];
        }
    },

    getTransactions: async (filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> => {
        try {
            const params = {
                page: filters.page || 1,
                limit: filters.limit || 20,
                ...(filters.category && { category: filters.category }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.search && { search: filters.search }),
                ...(filters.sortBy && { sortBy: filters.sortBy }),
                ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
            };
            const response = await api.get<PaginatedResponse<Transaction>>('/api/transactions', { params });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
        }
    },

    getRecurringTransactions: async (): Promise<Transaction[]> => {
        try {
            const response = await api.get<{ success: boolean; data: Transaction[] }>('/api/transactions/recurring');
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch recurring transactions:', error);
            return [];
        }
    },

    exportTransactions: async (format: 'csv' | 'pdf' = 'csv', filters: TransactionFilters = {}): Promise<Blob> => {
        const response = await api.get('/api/reporting/export', {
            params: { format, ...filters },
            responseType: 'blob',
        });
        return response.data;
    },
};
