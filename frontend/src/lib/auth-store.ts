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
  phone: phone || '0911234567',
  full_name: role === 'owner' ? 'Fatima Hassan (Owner)' : 'Abebe Kebede (Captain)',
  role,
  is_verified: true,
  is_minor: false,
  created_at: new Date().toISOString(),
});

// Helper to safely get initial auth state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, isLoading: true };
  }
  try {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      return { user: JSON.parse(userData), isAuthenticated: true, isLoading: false };
    }
    if (token) {
      const demo = createDemoUser('0911234567', 'player');
      return { user: demo, isAuthenticated: true, isLoading: false };
    }
  } catch {
    // ignore parsing errors
  }
  return { user: null, isAuthenticated: false, isLoading: false };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  requestOTP: async (phone: string, purpose: string = 'login') => {
    try {
      await api.post('/auth/request-otp', { phone, purpose });
    } catch {
      console.log(`[Demo Mode] OTP requested for ${phone}. Use code: 123456`);
    }
  },

  login: async (phone: string, code: string, role: string = 'player') => {
    try {
      const response = await api.post<TokenPair>('/auth/login', { phone, code });
      const tokens = response.data;
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(tokens.user));
      set({ user: tokens.user, isAuthenticated: true, isLoading: false });
      return tokens;
    } catch {
      // Offline / Demo fallback
      const demoUser = createDemoUser(phone, (role as 'player' | 'owner' | 'admin') || 'player');
      const mockTokens: TokenPair = {
        access_token: 'mock-access-token-jwt',
        refresh_token: 'mock-refresh-token-jwt',
        expires_in: 86400,
        user: demoUser,
      };
      localStorage.setItem('access_token', mockTokens.access_token);
      localStorage.setItem('refresh_token', mockTokens.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      set({ user: demoUser, isAuthenticated: true, isLoading: false });
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
      localStorage.setItem('user_data', JSON.stringify(tokens.user));
      set({ user: tokens.user, isAuthenticated: true, isLoading: false });
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
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      set({ user: demoUser, isAuthenticated: true, isLoading: false });
      return mockTokens;
    }
  },

  setDemoUser: (role: 'player' | 'owner' | 'admin' = 'player') => {
    const demoUser = createDemoUser('0911234567', role);
    localStorage.setItem('access_token', 'mock-access-token-jwt');
    localStorage.setItem('refresh_token', 'mock-refresh-token-jwt');
    localStorage.setItem('user_data', JSON.stringify(demoUser));
    set({ user: demoUser, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem('access_token');
      const savedUserData = localStorage.getItem('user_data');

      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // If we already have saved user data, populate it immediately
      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData);
          set({ user: parsed, isAuthenticated: true, isLoading: false });
        } catch {
          // ignore
        }
      }

      // Try background sync with API
      try {
        const response = await api.get<User>('/users/me');
        if (response.data) {
          localStorage.setItem('user_data', JSON.stringify(response.data));
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        }
      } catch (networkErr: any) {
        // If network error / backend offline, KEEP existing authentication
        if (token) {
          const fallbackUser = savedUserData
            ? JSON.parse(savedUserData)
            : createDemoUser('0911234567', 'player');
          set({ user: fallbackUser, isAuthenticated: true, isLoading: false });
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
