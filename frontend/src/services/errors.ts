export type ErrorCode = 'unauthorized' | 'forbidden' | 'not_found' | 'conflict' | 'validation' | 'network' | 'timeout' | 'cancelled' | 'server' | 'configuration' | 'unavailable';
export class ServiceError extends Error {
  constructor(public readonly code: ErrorCode, public readonly status = 0) { super(code); this.name = 'ServiceError'; }
}
export function errorCode(error: unknown): ErrorCode { return error instanceof ServiceError ? error.code : 'server'; }
export function statusCode(status: number): ErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429 || status === 503) return 'unavailable';
  return 'server';
}
