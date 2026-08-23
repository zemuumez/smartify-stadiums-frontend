import { create } from 'zustand';
import api, { User, TokenPair } from './api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOTP: (phone: string, purpose?: string) => Promise<void>;
  login: (phone: string, code: string) => Promise<TokenPair>;
  register: (phone: string, code: string, fullName: string, role?: string) => Promise<TokenPair>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  requestOTP: async (phone: string, purpose: string = 'login') => {
    await api.post('/auth/request-otp', { phone, purpose });
  },

  login: async (phone: string, code: string) => {
    const response = await api.post<TokenPair>('/auth/login', { phone, code });
    const tokens = response.data;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    set({ user: tokens.user, isAuthenticated: true });
    return tokens;
  },

  register: async (phone: string, code: string, fullName: string, role: string = 'player') => {
    const response = await api.post<TokenPair>('/auth/register', {
      phone,
      code,
      full_name: fullName,
      role,
    });
    const tokens = response.data;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    set({ user: tokens.user, isAuthenticated: true });
    return tokens;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await api.get<User>('/users/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
