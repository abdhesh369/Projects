import api from './api';
import { Transaction } from '../types';

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
        const response = await api.get<Transaction[]>('/transactions');
        return response.data;
    },
};
