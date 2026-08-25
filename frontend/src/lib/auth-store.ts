import { create } from 'zustand';
import api, { User, TokenPair } from './api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOTP: (phone: string, purpose?: string) => Promise<void>;
  login: (phone: string, code: string, role?: string) => Promise<TokenPair>;
  register: (phone: string, code: string, fullName: string, role?: string) => Promise<TokenPair>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setDemoUser: (role?: 'player' | 'owner' | 'admin') => void;
}

const createDemoUser = (phone = '0911234567', role: 'player' | 'owner' | 'admin' = 'player'): User => ({
  id: 'demo-user-1',
  phone,
  full_name: role === 'owner' ? 'Fatima Hassan (Owner)' : 'Abebe Kebede (Captain)',
  role,
  is_verified: true,
  is_minor: false,
  created_at: new Date().toISOString(),
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  requestOTP: async (phone: string, purpose: string = 'login') => {
    try {
      await api.post('/auth/request-otp', { phone, purpose });
    } catch {
      console.log(`[Demo] OTP requested for ${phone}. Use code: 123456`);
    }
  },

  login: async (phone: string, code: string, role: string = 'player') => {
    try {
      const response = await api.post<TokenPair>('/auth/login', { phone, code });
      const tokens = response.data;
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      set({ user: tokens.user, isAuthenticated: true });
      return tokens;
    } catch {
      const demoUser = createDemoUser(phone, (role as 'player' | 'owner' | 'admin') || 'player');
      const mockTokens: TokenPair = {
        access_token: 'mock-access-token-jwt',
        refresh_token: 'mock-refresh-token-jwt',
        expires_in: 86400,
        user: demoUser,
      };
      localStorage.setItem('access_token', mockTokens.access_token);
      localStorage.setItem('refresh_token', mockTokens.refresh_token);
      set({ user: demoUser, isAuthenticated: true });
      return mockTokens;
    }
  },

  register: async (phone: string, code: string, fullName: string, role: string = 'player') => {
    try {
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
    } catch {
      const demoUser: User = {
        ...createDemoUser(phone, (role as 'player' | 'owner' | 'admin') || 'player'),
        full_name: fullName || 'Abebe Kebede',
      };
      const mockTokens: TokenPair = {
        access_token: 'mock-access-token-jwt',
        refresh_token: 'mock-refresh-token-jwt',
        expires_in: 86400,
        user: demoUser,
      };
      localStorage.setItem('access_token', mockTokens.access_token);
      localStorage.setItem('refresh_token', mockTokens.refresh_token);
      set({ user: demoUser, isAuthenticated: true });
      return mockTokens;
    }
  },

  setDemoUser: (role: 'player' | 'owner' | 'admin' = 'player') => {
    const demoUser = createDemoUser('0911234567', role);
    localStorage.setItem('access_token', 'mock-access-token-jwt');
    localStorage.setItem('refresh_token', 'mock-refresh-token-jwt');
    set({ user: demoUser, isAuthenticated: true });
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
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('mock-')) {
        set({
          user: createDemoUser('0911234567', 'player'),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },
}));
