import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
}

/**
 * Runs an async function and exposes its pending / settled state.
 *
 * - If `deps` is provided the function is also called automatically on mount
 *   and whenever any dep changes (like `useEffect`).
 * - Call `execute()` manually to re-run at any time.
 * - Ignores stale responses when the component unmounts or deps change mid-flight.
 */
function useAsync<T>(
  fn: () => Promise<T>,
  deps?: React.DependencyList,
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep fn stable across renders when the caller passes an inline arrow.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []); // intentionally stable — callers use fnRef

  // Auto-run when deps are provided.
  useEffect(() => {
    if (deps === undefined) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fnRef.current();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, execute };
}

export default useAsync;
