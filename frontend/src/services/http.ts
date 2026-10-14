import type { RequestOptions, Transport } from './contracts';
import { ServiceError, statusCode } from './errors';

/** Cookie-session transport. The backend MUST verify CSRF, Origin and authorization. */
export function createHttpTransport(baseUrl: string, fetcher: typeof fetch = fetch, timeoutMs = 15000): Transport {
  if (!baseUrl.startsWith('/') && !/^https:\/\//.test(baseUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(baseUrl)) throw new ServiceError('configuration');
  if (baseUrl.startsWith('//') || /[?#]/.test(baseUrl)) throw new ServiceError('configuration');
  const base = baseUrl.replace(/\/$/, '');
  return {
    async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
      if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) throw new ServiceError('configuration');
      const controller = new AbortController();
      let timedOut = false;
      const abort = () => controller.abort();
      if (options.signal?.aborted) throw new ServiceError('cancelled');
      options.signal?.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
      try {
        const method = options.method || 'GET';
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (method !== 'GET') {
          // Token is deliberately neither persisted nor shared across sessions.
          const csrf = await fetcher(`${base}/auth/csrf`, { credentials: 'include', cache: 'no-store', signal: controller.signal });
          if (!csrf.ok) throw new ServiceError(statusCode(csrf.status), csrf.status);
          const value: unknown = await csrf.json();
          if (!value || typeof value !== 'object' || !('token' in value) || typeof value.token !== 'string' || !value.token) throw new ServiceError('server');
          headers['X-CSRF-Token'] = value.token;
        }
        if (options.body !== undefined) headers['Content-Type'] = 'application/json';
        if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
        const response = await fetcher(`${base}${path}`, {
          method, headers, credentials: 'include', cache: 'no-store', signal: controller.signal,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
        });
        if (!response.ok) throw new ServiceError(statusCode(response.status), response.status);
        if (response.status === 204) return undefined as T;
        if (!response.headers.get('content-type')?.includes('application/json')) throw new ServiceError('server');
        return await response.json() as T;
      } catch (error) {
        if (error instanceof ServiceError) throw error;
        if (controller.signal.aborted) throw new ServiceError(timedOut ? 'timeout' : 'cancelled');
        throw new ServiceError('network');
      } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', abort);
      }
    },
  };
}
