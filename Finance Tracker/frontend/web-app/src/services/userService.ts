import api from './api';
import { User, UserPreferences } from '../types';

export const userService = {
    updateProfile: async (data: { firstName: string; lastName: string }): Promise<User> => {
        const response = await api.put<User>('/users/profile', data);
        return response.data;
    },

    updatePreferences: async (preferences: Partial<UserPreferences>): Promise<User> => {
        const response = await api.put<User>('/users/preferences', preferences);
        return response.data;
    },
};
