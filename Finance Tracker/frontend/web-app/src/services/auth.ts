import api from './api';
import { LoginCredentials, RegisterData, User, AuthResponse } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/api/users/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  setupMFA: async (): Promise<{ secret: string; qrCode: string }> => {
    const response = await api.post('/api/auth/mfa/setup');
    return response.data;
  },

  verifyMFA: async (code: string): Promise<{ success: boolean }> => {
    const response = await api.post('/api/auth/mfa/verify', { code });
    return response.data;
  },

  disableMFA: async (): Promise<{ success: boolean }> => {
    const response = await api.post('/api/auth/mfa/disable');
    return response.data;
  },
};
