import api from './api';
import { Account, AccountFormData } from '../types';

export const accountService = {
    getAccounts: async (): Promise<Account[]> => {
        const response = await api.get<Account[]>('/api/accounts');
        return response.data;
    },

    getAccountById: async (id: string): Promise<Account> => {
        const response = await api.get<Account>(`/api/accounts/${id}`);
        return response.data;
    },

    createAccount: async (data: AccountFormData): Promise<Account> => {
        const response = await api.post<Account>('/api/accounts', data);
        return response.data;
    },

    updateAccount: async (id: string, data: Partial<AccountFormData>): Promise<Account> => {
        const response = await api.put<Account>(`/api/accounts/${id}`, data);
        return response.data;
    },

    deleteAccount: async (id: string): Promise<void> => {
        await api.delete(`/api/accounts/${id}`);
    },
};
