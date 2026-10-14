import { create } from 'zustand';
import type { Account, Role } from '@/services/contracts';
import { authService, selectDemoAccount } from '@/services';
import { ServiceError } from '@/services/errors';
import { isDemoMode } from '@/services/config';

interface AuthState {
  user: Account | null; isAuthenticated: boolean; isLoading: boolean; error: unknown;
  requestOTP: (phone: string, purpose?: string) => Promise<void>;
  login: (phone: string, code: string) => Promise<Account>;
  register: (phone: string, code: string, name: string, role?: string) => Promise<Account>;
  logout: () => Promise<void>; loadUser: () => Promise<void>;
  setDemoUser: (role?: Role) => Promise<void>; selectDemo: (id: string) => Promise<Account>;
}
let generation = 0;
export const useAuthStore = create<AuthState>((set) => {
  const authenticated = (user: Account) => { generation++; set({ user, isAuthenticated: true, isLoading: false, error: null }); return user; };
  return {
    user: null, isAuthenticated: false, isLoading: true, error: null,
    requestOTP: authService.requestOTP,
    login: async (phone, code) => authenticated(await authService.login(phone, code)),
    register: async (phone, code, name, role = 'player') => {
      if (role !== 'player' && role !== 'owner') throw new ServiceError('forbidden');
      return authenticated(await authService.register(phone, code, name, role));
    },
    selectDemo: async (id) => authenticated(await selectDemoAccount(id)),
    setDemoUser: async (role = 'player') => {
      if (!isDemoMode) throw new ServiceError('forbidden');
      const { demoAccountForRole } = await import('@/demo/account-options');
      authenticated(await selectDemoAccount(demoAccountForRole(role)));
    },
    logout: async () => {
      await authService.logout(); generation++;
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    },
    loadUser: async () => {
      const requestGeneration = generation;
      try { ['access_token', 'refresh_token', 'user_data'].forEach(key => localStorage.removeItem(key)); } catch { /* Storage may be disabled. */ }
      try {
        const user = await authService.current();
        if (generation === requestGeneration) set({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch (error) {
        if (generation === requestGeneration) set({ user: null, isAuthenticated: false, isLoading: false, error: error instanceof ServiceError && error.code === 'unauthorized' ? null : error });
      }
    },
  };
});
