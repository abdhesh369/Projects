import api from './api';

export interface UserSession {
    id: string;
    ipAddress: string;
    userAgent: string;
    lastActive: string;
    isCurrent: boolean;
}

export const sessionService = {
    getSessions: async (): Promise<UserSession[]> => {
        const response = await api.get<UserSession[]>('/api/auth/sessions');
        return response.data;
    },

    logoutAll: async (): Promise<void> => {
        await api.post('/api/auth/logout-all');
    },

    logoutOther: async (id: string): Promise<void> => {
        await api.delete(`/api/auth/sessions/${id}`);
    },
};
