import { ServiceError } from './errors';
export function resolveMode(value: string | undefined): 'demo' | 'api' {
  if (value === 'demo') return 'demo';
  if (!value || value === 'api') return 'api';
  throw new ServiceError('configuration');
}
export const dataMode = resolveMode(process.env.NEXT_PUBLIC_DATA_MODE);
export const isDemoMode = dataMode === 'demo';
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
