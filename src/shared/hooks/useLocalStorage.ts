import { useState, useEffect, useCallback } from 'react';

/**
 * Persists state to localStorage and syncs across browser tabs via the
 * `storage` event.
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      } catch {
        // Silently ignore quota / serialisation errors.
      }
    },
    [key],
  );

  // Sync when another tab writes to the same key.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== window.localStorage) return;
      try {
        const next =
          event.newValue !== null
            ? (JSON.parse(event.newValue) as T)
            : initialValue;
        setStoredValue(next);
      } catch {
        // Malformed JSON — ignore.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
