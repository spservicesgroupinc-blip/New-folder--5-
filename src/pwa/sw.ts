/// <reference lib="webworker" />

import { handleInstall, handleActivate, handleFetch } from './sw-cache';
import { handlePushEvent, handleNotificationClick } from './sw-push';
import { handleNotificationClose } from './sw-notifications';
import { handleBackgroundSync, SYNC_QUEUE_NAME as _SYNC_QUEUE } from './sw-sync';

declare const self: ServiceWorkerGlobalScope;

// Local re-declarations for SW-specific event types not in lib.webworker.d.ts
interface NotificationClickEvent extends ExtendableEvent {
  action: string;
  notification: Notification;
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

self.addEventListener('install', (event: ExtendableEvent) => {
  handleInstall(event);
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  handleActivate(event);
});

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

self.addEventListener('fetch', (event: FetchEvent) => {
  handleFetch(event);
});

// ---------------------------------------------------------------------------
// Push notifications
// ---------------------------------------------------------------------------

self.addEventListener('push', (event: PushEvent) => {
  handlePushEvent(event);
});

self.addEventListener('notificationclick', (event: NotificationClickEvent) => {
  handleNotificationClick(event);
});

self.addEventListener('notificationclose', (event: NotificationEvent) => {
  handleNotificationClose(event);
});

// ---------------------------------------------------------------------------
// Background sync
// ---------------------------------------------------------------------------

self.addEventListener('sync', (event: Event) => {
  handleBackgroundSync(event as SyncEvent);
});
