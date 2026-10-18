import type { Account, Role, Transport } from './contracts';
import { ServiceError } from './errors';
export function normalizePhone(phone: string) {
  const value = phone.replace(/[\s()-]/g, '').replace(/^0/, '+251');
  if (!/^\+251[79]\d{8}$/.test(value)) throw new ServiceError('validation');
  return value;
}
export function createAuthService(transport: Transport) {
  return {
    requestOTP: (phone: string, purpose = 'login') => transport.request<void>('/auth/request-otp', { method: 'POST', body: { phone: normalizePhone(phone), purpose } }),
    login: (phone: string, code: string) => transport.request<Account>('/auth/login', { method: 'POST', body: { phone: normalizePhone(phone), code } }),
    register: (phone: string, code: string, full_name: string, role: Exclude<Role, 'admin'>) => transport.request<Account>('/auth/register', { method: 'POST', body: { phone: normalizePhone(phone), code, full_name, role } }),
    current: (signal?: AbortSignal) => transport.request<Account>('/users/me', { signal }),
    logout: () => transport.request<void>('/auth/logout', { method: 'POST' }),
  };
}
