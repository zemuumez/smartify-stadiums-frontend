'use client';
import { useCallback, useEffect, useState } from 'react';

/** Checks value equality for primitives and shallow equality for arrays. */
export function areQueryKeysEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }
  return false;
}

function serializeKey(key: unknown): string | unknown {
  if (typeof key === 'object' && key !== null) {
    try {
      return JSON.stringify(key);
    } catch {
      return key;
    }
  }
  return key;
}

/**
 * Pass a stable useCallback loader and an optional explicit query key.
 *
 * Resource preservation rules:
 * - When refreshing the same resource (e.g. reload() or same query key), previous data
 *   is preserved during loading to keep UI elements (like confirmation dialogs) mounted.
 * - When query identity changes (e.g. different key or loader), previous data is immediately
 *   reset to undefined so stale actionable data from the previous resource is never displayed.
 */
export function useServiceQuery<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  key?: unknown
): { data?: T; error?: unknown; loading: boolean; reload: () => void };
export function useServiceQuery<T>(
  key: unknown,
  loader: (signal: AbortSignal) => Promise<T>
): { data?: T; error?: unknown; loading: boolean; reload: () => void };
export function useServiceQuery<T>(
  arg1: unknown | ((signal: AbortSignal) => Promise<T>),
  arg2?: unknown | ((signal: AbortSignal) => Promise<T>)
): { data?: T; error?: unknown; loading: boolean; reload: () => void } {
  const loader = (typeof arg1 === 'function' ? arg1 : arg2) as (signal: AbortSignal) => Promise<T>;
  const explicitKey = typeof arg1 === 'function' ? arg2 : arg1;
  const currentKey = explicitKey !== undefined ? explicitKey : loader;
  const serializedKey = serializeKey(currentKey);

  const [state, setState] = useState<{
    key: unknown;
    data?: T;
    error?: unknown;
    loading: boolean;
  }>({
    key: serializedKey,
    loading: true,
  });

  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(value => value + 1), []);

  const isSameResource = areQueryKeysEqual(state.key, serializedKey);
  const effectiveData = isSameResource ? state.data : undefined;
  const effectiveError = isSameResource ? state.error : undefined;
  const effectiveLoading = isSameResource ? state.loading : true;

  useEffect(() => {
    const controller = new AbortController();
    const requestKey = serializedKey;

    // The microtask represents the beginning of this async request, not render-time work.
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setState(prev => {
          const isSame = areQueryKeysEqual(prev.key, requestKey);
          return {
            key: requestKey,
            data: isSame ? prev.data : undefined,
            error: undefined,
            loading: true,
          };
        });
      }
    });

    loader(controller.signal)
      .then(data => {
        if (!controller.signal.aborted) {
          setState({ key: requestKey, data, loading: false });
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setState({ key: requestKey, error, loading: false });
        }
      });

    return () => controller.abort();
  }, [loader, version, serializedKey]);

  return { data: effectiveData, error: effectiveError, loading: effectiveLoading, reload };
}
