/**
 * localCache.ts
 *
 * Cache-aside helpers for localStorage. Every operation is wrapped in a
 * try/catch because localStorage throws in private-browsing modes and when
 * storage quota is exceeded.
 */

/**
 * Reads a JSON-deserialised value from localStorage.
 * Returns null if the key is absent, the value is unparseable, or storage
 * is unavailable.
 */
export function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`localCache.get("${key}") failed:`, err);
    return null;
  }
}

/**
 * Serialises `value` to JSON and writes it to localStorage under `key`.
 * Silently no-ops if storage is unavailable or quota is exceeded.
 */
export function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`localCache.set("${key}") failed:`, err);
  }
}

/**
 * Removes the entry at `key`. No-ops if the key does not exist or storage
 * is unavailable.
 */
export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`localCache.remove("${key}") failed:`, err);
  }
}

/**
 * Clears ALL localStorage entries for the current origin. Use with care —
 * prefer `remove` when only specific keys need to be cleared.
 */
export function clear(): void {
  try {
    localStorage.clear();
  } catch (err) {
    console.warn('localCache.clear() failed:', err);
  }
}

const localCache = { get, set, remove, clear };
export default localCache;
