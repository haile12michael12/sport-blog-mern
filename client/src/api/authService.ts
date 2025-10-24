import apiClient from './apiClient';
import { LoginInput, RegisterInput } from '@shared/schema';

export const authService = {
  login: async (data: LoginInput) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterInput) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};