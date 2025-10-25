import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@shared/schema';
import { authService } from '@/api/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setToken: (token: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const data = await authService.login({ email, password });
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true
          });
        } catch (error) {
          throw error;
        }
      },

      register: async (data) => {
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true
          });
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });
      },

      setToken: (token, refreshToken) => {
        set({ token, refreshToken, isAuthenticated: true });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
