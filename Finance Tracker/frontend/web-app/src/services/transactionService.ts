import api from './api';
import { Transaction, PaginatedResponse } from '../types';

export const transactionService = {
    getRecentTransactions: async (limit: number = 5): Promise<Transaction[]> => {
        // Currently, our transaction service is not explicitly created, 
        // but we can query it via the gateway if implemented.
        // For now, let's assume it's part of the service suite.
        try {
            const response = await api.get<Transaction[]>('/transactions/recent', { params: { limit } });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch recent transactions:', error);
            return [];
        }
    },

    getTransactions: async (): Promise<Transaction[]> => {
        try {
            const response = await api.get<PaginatedResponse<Transaction>>('/transactions');
            return response.data.items || [];
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            return [];
        }
    },

    getRecurringTransactions: async (): Promise<Transaction[]> => {
        try {
            const response = await api.get<{ success: boolean; data: Transaction[] }>('/transactions/recurring');
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch recurring transactions:', error);
            return [];
        }
    },
};
