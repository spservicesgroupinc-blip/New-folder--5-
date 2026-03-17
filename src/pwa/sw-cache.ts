/// <reference lib="webworker" />

export const CACHE_NAME = 'rfe-foam-pro-v10-desktop';

export const URLS_TO_PRECACHE = ['./index.html', './manifest.json', './'];

/**
 * Handles fetch events using a mixed strategy:
 * - Navigation requests: Network-First with cache fallback
 * - Google Script API calls: Network-Only (pass-through)
 * - Static assets: Stale-While-Revalidate
 */
export function handleFetch(event: FetchEvent): void {
  // Navigation: Network-First, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match('./index.html') as Promise<Response>)
    );
    return;
  }

  // Google Apps Script API: Network-Only
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  // Static assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => undefined);

      return (cachedResponse || fetchPromise) as Promise<Response>;
    })
  );
}

/**
 * Install handler: precaches the app shell URLs.
 */
export function handleInstall(event: ExtendableEvent): void {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_PRECACHE))
      .then(() => (self as unknown as ServiceWorkerGlobalScope).skipWaiting())
  );
}

/**
 * Activate handler: prunes stale caches and claims all clients.
 */
export function handleActivate(event: ExtendableEvent): void {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => (self as unknown as ServiceWorkerGlobalScope).clients.claim())
  );
}
