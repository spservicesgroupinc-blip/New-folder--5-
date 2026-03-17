/**
 * storageKeys.ts
 *
 * Single source-of-truth for all localStorage and IndexedDB key strings used
 * across the application. Importing from here prevents typo-driven bugs and
 * makes key changes trivially refactorable.
 */

export const STORAGE_KEYS = {
  /** Persisted UserSession object for the logged-in admin or crew member. */
  SESSION: 'foamProSession',

  /** Flag/payload granting temporary trial-mode access. */
  TRIAL_ACCESS: 'foamProTrialAccess',

  /** Full serialised CalculatorState written by the local cache layer. */
  APP_DATA: 'foamProAppData',

  /** Offline mutation queue flushed when connectivity is restored. */
  SYNC_QUEUE: 'foamProSyncQueue',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
