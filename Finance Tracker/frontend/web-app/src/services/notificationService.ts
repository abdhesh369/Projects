import api from './api';
import { AppNotification } from '../types';

export const notificationService = {
    async getNotifications(): Promise<AppNotification[]> {
        const response = await api.get('/api/notifications');
        // The backend might return an array or { data: array } depending on setup, but typically array.
        return response.data;
    },

    async markAsRead(id: string): Promise<AppNotification> {
        const response = await api.patch(`/api/notifications/${id}/read`);
        return response.data;
    },
};
