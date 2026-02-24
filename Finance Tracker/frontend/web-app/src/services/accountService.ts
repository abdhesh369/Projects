import api from './api';
import { Account, AccountFormData } from '../types';

export const accountService = {
    getAccounts: async (): Promise<Account[]> => {
        const response = await api.get<Account[]>('/accounts');
        return response.data;
    },

    getAccountById: async (id: string): Promise<Account> => {
        const response = await api.get<Account>(`/accounts/${id}`);
        return response.data;
    },

    createAccount: async (data: AccountFormData): Promise<Account> => {
        const response = await api.post<Account>('/accounts', data);
        return response.data;
    },

    updateAccount: async (id: string, data: Partial<AccountFormData>): Promise<Account> => {
        const response = await api.put<Account>(`/accounts/${id}`, data);
        return response.data;
    },

    deleteAccount: async (id: string): Promise<void> => {
        await api.delete(`/accounts/${id}`);
    },
};
