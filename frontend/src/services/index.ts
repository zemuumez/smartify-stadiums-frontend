import { apiBaseUrl, isDemoMode } from './config';
import type { Transport } from './contracts';
import { createServices } from './create-services';
import { createHttpTransport } from './http';
import { ServiceError } from './errors';

let demo: Promise<ReturnType<typeof import('../demo/transport')['createDemoTransport']>> | undefined;
function getDemo() {
  if (!isDemoMode) throw new ServiceError('forbidden');
  return demo ??= import('../demo/transport').then(({ createDemoTransport }) => {
    let storage: Storage | undefined;
    try { if (typeof window !== 'undefined') storage = window.sessionStorage; } catch { /* In-memory demo fallback only. */ }
    return createDemoTransport(storage);
  });
}
const transport: Transport = isDemoMode
  ? { async request<T>(path: string, options?: Parameters<Transport['request']>[1]) { return (await getDemo()).request<T>(path, options); } }
  : createHttpTransport(apiBaseUrl);
export const services = createServices(transport);
export const { auth: authService, venues: venuesService, bookings: bookingsService, content: contentService, teams: teamsService, media: mediaService, billing: billingService, admin: adminService } = services;
export async function selectDemoAccount(id: string) { return (await getDemo()).selectAccount(id); }
