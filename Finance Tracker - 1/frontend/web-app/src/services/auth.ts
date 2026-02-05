import api from './api';
import { LoginCredentials, RegisterData, User, AuthResponse } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Basic logout is handled by removing the token in AuthContext/Interceptors
    return Promise.resolve();
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
