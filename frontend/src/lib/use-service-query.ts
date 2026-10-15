'use client';
import { useCallback, useEffect, useState } from 'react';
/** Pass a stable useCallback loader. Aborts obsolete reads and ignores stale responses. */
export function useServiceQuery<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: unknown; loading: boolean }>({ loading: true });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    // The microtask represents the beginning of this async request, not render-time work.
    Promise.resolve().then(() => { if (!controller.signal.aborted) setState(prev => ({ ...prev, loading: true })); });
    loader(controller.signal).then(data => { if (!controller.signal.aborted) setState({ data, loading: false }); }).catch(error => { if (!controller.signal.aborted) setState({ error, loading: false }); });
    return () => controller.abort();
  }, [loader, version]);
  return { ...state, reload };
}
