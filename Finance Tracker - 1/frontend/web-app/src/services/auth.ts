import { LoginCredentials, RegisterData, User, AuthResponse } from '../types';

const MOCK_USER: User = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date().toISOString(),
  preferences: {
    currency: 'USD',
    theme: 'dark',
    notifications: true,
  },
};

const TAB_DELAY = 1000;

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'john@example.com' && credentials.password === 'password') {
          resolve({
            user: MOCK_USER,
            token: 'mock-jwt-token',
          });
        } else {
          // For demo purposes, allow any login but with provided email
          resolve({
            user: { ...MOCK_USER, email: credentials.email },
            token: 'mock-jwt-token',
          });
        }
      }, TAB_DELAY);
    });
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: '2',
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            createdAt: new Date().toISOString(),
            preferences: {
              currency: 'USD',
              theme: 'dark',
              notifications: true,
            },
          },
          token: 'mock-jwt-token',
        });
      }, TAB_DELAY);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          resolve(MOCK_USER); // In real app, validate token
        } else {
          resolve(null);
        }
      }, 500);
    });
  },
};
