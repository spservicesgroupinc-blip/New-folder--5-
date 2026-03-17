/// <reference lib="webworker" />

// SyncEvent is part of the Background Sync API — not in standard lib.webworker.d.ts
interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

/** Name used when registering background sync events on the client. */
export const SYNC_QUEUE_NAME = 'foam-pro-sync-queue';

interface QueuedMutation {
  id: string;
  action: string;
  payload: unknown;
  timestamp: number;
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Reads queued mutations from IndexedDB and replays them against the backend.
 * Called when the browser fires a 'sync' event for SYNC_QUEUE_NAME.
 */
async function replayQueue(): Promise<void> {
  const mutations = await readQueuedMutations();
  if (mutations.length === 0) return;

  const failed: QueuedMutation[] = [];

  for (const mutation of mutations) {
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mutation.action, payload: mutation.payload }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await removeQueuedMutation(mutation.id);
    } catch (err) {
      console.warn('[SW] Sync replay failed for', mutation.id, err);
      failed.push(mutation);
    }
  }

  if (failed.length > 0) {
    // Re-throw so the browser re-schedules the sync event
    throw new Error(`${failed.length} mutation(s) failed to sync`);
  }
}

/**
 * Handles 'sync' events from the browser Background Sync API.
 */
export function handleBackgroundSync(event: SyncEvent): void {
  if (event.tag === SYNC_QUEUE_NAME) {
    event.waitUntil(replayQueue());
  }
}

// ---------------------------------------------------------------------------
// IDB helpers (lightweight, no library dependency)
// ---------------------------------------------------------------------------

const DB_NAME = 'foam-pro-offline';
const STORE_NAME = 'sync-queue';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readQueuedMutations(): Promise<QueuedMutation[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as QueuedMutation[]);
    req.onerror = () => reject(req.error);
  });
}

async function removeQueuedMutation(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
